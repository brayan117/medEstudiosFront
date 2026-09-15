import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild
} from '@angular/core';

import {
  Enums,
  getWebWorkerManager,
  init as cornerstoneInit,
  RenderingEngine,
  StackViewport
} from '@cornerstonejs/core';

import {
  init as dicomImageLoaderInit
} from '@cornerstonejs/dicom-image-loader';

@Component({
  selector: 'app-dicom-viewer',
  standalone: true,
  imports: [],
  templateUrl: './dicom-viewer.html',
  styleUrl: './dicom-viewer.css'
})
export class DicomViewer implements AfterViewInit, OnDestroy {

  @ViewChild('dicomElement', { static: true })
  dicomElement!: ElementRef<HTMLDivElement>;

  private renderingEngine!: RenderingEngine;
  private cornerstoneInitialized = false;
  private resizeObserver?: ResizeObserver;
  private refreshTimeout?: ReturnType<typeof setTimeout>;
  private destroyed = false;
  public currentImageIndex = 0;

  // Window/Level controls
  public windowWidth = 400;
  public windowCenter = 40;
  public windowWidthStep = 10;
  public windowCenterStep = 10;

  // DICOM metadata
  private dicomMetadata: any = null;

  // CT Presets
  private readonly ctPresets = {
    lung: { width: 1600, center: -600 },
    bone: { width: 2000, center: 300 },
    softTissue: { width: 400, center: 40 },
    brain: { width: 80, center: 40 }
  };

  private readonly renderingEngineId = 'medEstudiosRenderingEngine';
  private readonly viewportId = 'dicomViewport';

  public readonly dicomFileNames = [
    'CT.1.2.840.113619.2.5.4111977828.11918.1774124413.926.dcm',
    'CT.1.2.840.113619.2.5.4111977828.15842.1777252247.665.dcm',
    'CT.1.2.840.113619.2.5.4111977828.15842.1777252247.666.dcm',
    'CT.1.2.840.113619.2.5.4111977828.15842.1777252247.667.dcm'
  ];

  private readonly refreshDelays = [100, 250, 1000, 3000];

  @HostListener('window:resize')
  onWindowResize(): void {
    this.scheduleViewportRefresh(100);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft') {
      this.previousImage();
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    } else if (event.key === 'ArrowUp') {
      this.increaseWindowCenter();
    } else if (event.key === 'ArrowDown') {
      this.decreaseWindowCenter();
    } else if (event.key === 'w' || event.key === 'W') {
      this.increaseWindowWidth();
    } else if (event.key === 's' || event.key === 'S') {
      this.decreaseWindowWidth();
    } else if (event.key === 'r' || event.key === 'R') {
      this.resetWindowLevel();
    }
  }

  nextImage(): void {
    if (this.currentImageIndex < this.dicomFileNames.length - 1) {
      this.currentImageIndex++;
      this.updateDisplayedImage();
    }
  }

  previousImage(): void {
    if (this.currentImageIndex > 0) {
      this.currentImageIndex--;
      this.updateDisplayedImage();
    }
  }

  private async updateDisplayedImage(): Promise<void> {
    if (!this.cornerstoneInitialized || !this.renderingEngine) {
      return;
    }

    try {
      const viewport = this.renderingEngine.getViewport(
        this.viewportId
      ) as unknown as StackViewport;

      if (!viewport) {
        return;
      }

      await viewport.setStack(
        this.dicomFileNames.map(
          (fileName) => `wadouri:/${fileName}`
        ),
        this.currentImageIndex
      );

      // Extract DICOM metadata for the new image
      await this.extractDicomMetadata();

      // Apply appropriate window/level based on metadata
      await this.applyOptimalWindowLevel();

      await this.refreshViewport();
      console.log('Cambiado a imagen:', this.currentImageIndex);
    } catch (error) {
      console.error('Error al cambiar de imagen:', error);
    }
  }

  // Window/Level controls
  increaseWindowWidth(): void {
    this.windowWidth += this.windowWidthStep;
    this.applyWindowLevel();
  }

  decreaseWindowWidth(): void {
    this.windowWidth = Math.max(1, this.windowWidth - this.windowWidthStep);
    this.applyWindowLevel();
  }

  increaseWindowCenter(): void {
    this.windowCenter += this.windowCenterStep;
    this.applyWindowLevel();
  }

  decreaseWindowCenter(): void {
    this.windowCenter -= this.windowCenterStep;
    this.applyWindowLevel();
  }

  resetWindowLevel(): void {
    this.applyOptimalWindowLevel();
  }

  applyCtPreset(preset: keyof typeof this.ctPresets): void {
    const presetValues = this.ctPresets[preset];
    this.windowWidth = presetValues.width;
    this.windowCenter = presetValues.center;
    this.applyWindowLevel();
  }

  private async applyWindowLevel(): Promise<void> {
    if (!this.renderingEngine) {
      return;
    }

    try {
      const viewport = this.renderingEngine.getViewport(
        this.viewportId
      ) as unknown as StackViewport;

      if (!viewport) {
        return;
      }

      // Convert Window Center/Width to lower/upper bounds
      const lower = this.windowCenter - (this.windowWidth / 2);
      const upper = this.windowCenter + (this.windowWidth / 2);

      viewport.setProperties({ voiRange: { lower, upper } });
      await this.refreshViewport();
    } catch (error) {
      console.error('Error al aplicar Window/Level:', error);
    }
  }

  private async extractDicomMetadata(): Promise<void> {
    if (!this.renderingEngine) {
      return;
    }

    try {
      const viewport = this.renderingEngine.getViewport(
        this.viewportId
      ) as unknown as StackViewport;

      if (!viewport) {
        return;
      }

      const image = viewport.getCornerstoneImage();
      if (!image) {
        return;
      }

      // Try to extract metadata from the image object
      // Different Cornerstone versions may have different structures
      this.dicomMetadata = {
        windowCenter: (image as any).windowCenter || null,
        windowWidth: (image as any).windowWidth || null,
        rescaleIntercept: (image as any).rescaleIntercept || 0,
        rescaleSlope: (image as any).rescaleSlope || 1,
        bitsAllocated: (image as any).bitsAllocated || 16,
        bitsStored: (image as any).bitsStored || 12,
        pixelRepresentation: (image as any).pixelRepresentation || 0,
        photometricInterpretation: (image as any).photometricInterpretation || 'MONOCHROME2',
        modality: (image as any).modality || 'CT',
        minPixelValue: image.minPixelValue,
        maxPixelValue: image.maxPixelValue
      };

      console.log('Metadatos DICOM extraídos:', this.dicomMetadata);
    } catch (error) {
      console.error('Error al extraer metadatos DICOM:', error);
      // Set default values if extraction fails
      this.dicomMetadata = {
        windowCenter: null,
        windowWidth: null,
        rescaleIntercept: 0,
        rescaleSlope: 1,
        bitsAllocated: 16,
        bitsStored: 12,
        pixelRepresentation: 0,
        photometricInterpretation: 'MONOCHROME2',
        modality: 'CT',
        minPixelValue: 0,
        maxPixelValue: 4095
      };
    }
  }

  private async applyOptimalWindowLevel(): Promise<void> {
    if (!this.dicomMetadata) {
      // Fallback to default CT values if no metadata
      this.windowWidth = 400;
      this.windowCenter = 40;
      console.log('Usando valores por defecto CT (sin metadatos)');
      return;
    }

    const { windowCenter, windowWidth, modality, photometricInterpretation } = this.dicomMetadata;

    // Check if DICOM has native Window Center/Width
    if (windowCenter && windowWidth) {
      try {
        this.windowCenter = parseFloat(windowCenter);
        this.windowWidth = parseFloat(windowWidth);
        console.log('Usando Window/Level nativo del DICOM:', { windowCenter: this.windowCenter, windowWidth: this.windowWidth });
        return;
      } catch (e) {
        console.warn('Error al parsear Window/Level nativo, usando defaults');
      }
    }

    // Apply modality-specific defaults
    switch (modality) {
      case 'CT':
        this.windowWidth = 400;
        this.windowCenter = 40;
        console.log('Usando valores por defecto CT');
        break;
      case 'CR': // Computed Radiography
      case 'DR': // Digital Radiography
      case 'XA': // X-Ray Angiography
      case 'RF': // Radiofluoroscopy
        this.windowWidth = 2000;
        this.windowCenter = 1000;
        console.log('Usando valores por defecto Radiografía');
        break;
      case 'MR': // MRI
        this.windowWidth = 500;
        this.windowCenter = 250;
        console.log('Usando valores por defecto MRI');
        break;
      default:
        this.windowWidth = 400;
        this.windowCenter = 40;
        console.log('Usando valores por defecto genéricos');
    }

    // Handle MONOCHROME1 (inverted grayscale)
    if (photometricInterpretation === 'MONOCHROME1') {
      console.log('Detectado MONOCHROME1 - imagen con escala invertida');
      // Cornerstone should handle this automatically, but we could apply additional inversion if needed
    }
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    this.resizeObserver?.disconnect();
    this.renderingEngine?.destroy();
  }

  async ngAfterViewInit(): Promise<void> {
    try {
      await cornerstoneInit();
      console.log('Cornerstone3D core inicializado');

      const workerManager = getWebWorkerManager();
      workerManager.registerWorker(
        'dicomImageLoader',
        () => new Worker('/cs-worker/decodeImageFrameWorker.js', { type: 'module' }),
        { maxWorkerInstances: 2, overwrite: true }
      );
      console.log('Web Worker de decodificación DICOM registrado');

      dicomImageLoaderInit({
        wasmBasePath: '/cs-wasm/'
      });
      console.log('DICOM image loader inicializado');

      this.initializeViewport();
      this.cornerstoneInitialized = true;

      this.setupResizeObserver();
      await this.loadSampleDicomFiles();
      this.scheduleInitialRefreshes();
    } catch (error) {
      console.error('Error al inicializar Cornerstone3D:', error);
    }
  }

  private initializeViewport(): void {
    try {
      this.renderingEngine = new RenderingEngine(
        this.renderingEngineId
      );

      this.renderingEngine.enableElement({
        viewportId: this.viewportId,
        element: this.dicomElement.nativeElement,
        type: Enums.ViewportType.STACK
      });

      console.log('Viewport DICOM creado exitosamente');
    } catch (error) {
      console.error('Error al crear viewport DICOM:', error);
    }
  }

  private setupResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.scheduleViewportRefresh(50);
    });
    this.resizeObserver.observe(this.dicomElement.nativeElement);
  }

  private scheduleInitialRefreshes(): void {
    this.refreshDelays.forEach((delay) => {
      setTimeout(() => this.refreshViewportIfReady(), delay);
    });
  }

  private scheduleViewportRefresh(delay: number): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    this.refreshTimeout = setTimeout(() => this.refreshViewportIfReady(), delay);
  }

  private async refreshViewportIfReady(): Promise<void> {
    if (this.destroyed) {
      return;
    }

    const element = this.dicomElement.nativeElement;

    if (element.clientWidth <= 0 || element.clientHeight <= 0) {
      return;
    }

    await this.refreshViewport();
  }

  private async refreshViewport(): Promise<void> {
    if (!this.renderingEngine) {
      return;
    }

    try {
      const viewport = this.renderingEngine.getViewport(
        this.viewportId
      ) as unknown as StackViewport;

      if (!viewport) {
        return;
      }

      this.renderingEngine.resize(true, true);

      await new Promise<void>((resolve) => {
        this.renderingEngine!.render();
        requestAnimationFrame(() => resolve());
      });
    } catch (error) {
      console.error('Error al refrescar el viewport DICOM:', error);
    }
  }

  private async loadSampleDicomFiles(): Promise<void> {
    if (!this.cornerstoneInitialized || !this.renderingEngine) {
      console.error('Cornerstone no está inicializado');
      return;
    }

    try {
      const viewport = this.renderingEngine.getViewport(
        this.viewportId
      ) as unknown as StackViewport;

      if (!viewport) {
        console.error('No se encontró el viewport DICOM');
        return;
      }

      const imageIds = this.dicomFileNames.map(
        (fileName) => `wadouri:/${fileName}`
      );

      console.log('Cargando imágenes DICOM:', imageIds);

      await viewport.setStack(imageIds, 0);
      console.log('Imágenes DICOM configuradas exitosamente');

      // Extract DICOM metadata and apply optimal window/level
      await this.extractDicomMetadata();
      await this.applyOptimalWindowLevel();

      await this.refreshViewport();
      console.log('Imagen DICOM renderizada exitosamente');
    } catch (error) {
      console.error('Error al cargar archivos DICOM:', error);
    }
  }

}