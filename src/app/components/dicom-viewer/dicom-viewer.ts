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
  private voiApplied = false;
  private destroyed = false;

  private readonly renderingEngineId = 'medEstudiosRenderingEngine';
  private readonly viewportId = 'dicomViewport';

  private readonly dicomFileNames = [
    'CT.1.2.840.113619.2.5.4111977828.11918.1774124413.926.dcm'
  ];

  private readonly refreshDelays = [100, 250, 1000, 3000];

  @HostListener('window:resize')
  onWindowResize(): void {
    this.scheduleViewportRefresh(100);
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

      if (!this.voiApplied) {
        await this.applyAdaptiveVoiRange(viewport);
        this.voiApplied = true;
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

      console.log('Cargando imagen DICOM:', imageIds[0]);

      await viewport.setStack(imageIds, 0);
      console.log('Imagen DICOM configurada exitosamente');

      await this.refreshViewport();
      console.log('Imagen DICOM renderizada exitosamente');
    } catch (error) {
      console.error('Error al cargar archivos DICOM:', error);
    }
  }

  private async applyAdaptiveVoiRange(viewport: StackViewport): Promise<void> {
    const image = viewport.getCornerstoneImage();

    if (!image) {
      console.warn('No hay imagen para calcular rango de visualización');
      return;
    }

    const minValue = image.minPixelValue;
    const maxValue = image.maxPixelValue;

    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
      return;
    }

    const range = maxValue - minValue;

    if (range <= 0) {
      return;
    }

    const lower = minValue;
    const upper = minValue + (range * 0.3);

    viewport.setProperties({ voiRange: { lower, upper } });
  }
}