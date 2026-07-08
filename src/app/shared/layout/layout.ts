import { Component } from '@angular/core';
import { Sliderbar } from '../components/sliderbar/sliderbar';

@Component({
  selector: 'app-layout',
  imports: [Sliderbar],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
  standalone: true
})
export class Layout {}
