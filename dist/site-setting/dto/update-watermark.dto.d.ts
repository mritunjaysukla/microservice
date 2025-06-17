export declare class WatermarkOptionsDto {
    position: 'full' | 'center' | 'bottom-right' | 'custom';
    opacity: number;
    scale: number;
    customX: number;
    customY: number;
    pattern: 'diagonal' | 'grid' | 'radial' | 'unsplash';
    text: string;
    textColor: string;
    textSize: number;
    textRotation: number;
    spacing: number;
}
