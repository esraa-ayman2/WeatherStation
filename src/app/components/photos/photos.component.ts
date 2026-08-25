import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WeatherPhotoItem } from '../../interfaces';
import { WeatherService } from '../../services/weather.service';

@Component({
  selector: 'app-photos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photos.component.html',
  styleUrls: ['./photos.component.css'],
})
export class PhotosComponent {
  @Output() backToHome = new EventEmitter<void>();

  public allPhotos: WeatherPhotoItem[] = [];
  public selectedCategory = 'All';
  public categories = ['All', 'Sunset', 'Storm', 'Clouds', 'Aurora', 'Snow'];
  public likedPhotos: { [id: string]: boolean } = {};
  public likeCounts: { [id: string]: number } = {};

  constructor(private weatherService: WeatherService) {
    this.allPhotos = this.weatherService.getPhotos();
    this.allPhotos.forEach((p) => {
      this.likeCounts[p.id] = p.likes;
    });
  }

  public get filteredPhotos(): WeatherPhotoItem[] {
    if (this.selectedCategory === 'All') return this.allPhotos;
    return this.allPhotos.filter((p) => p.category === this.selectedCategory);
  }

  public setCategory(cat: string): void {
    this.selectedCategory = cat;
  }

  public toggleLike(photoId: string): void {
    const current = this.likedPhotos[photoId] || false;
    this.likedPhotos[photoId] = !current;
    if (!current) {
      this.likeCounts[photoId] = (this.likeCounts[photoId] || 0) + 1;
    } else {
      this.likeCounts[photoId] = Math.max(0, (this.likeCounts[photoId] || 1) - 1);
    }
  }

  public onBack(): void {
    this.backToHome.emit();
  }
}
