import vision from '@google-cloud/vision';
import { Image } from '@resources/schema';
import { EnvironmentOption } from '@src/utility/environment/EnvironmentUtility';

export interface FilteredImageResults {
    clean: Image[];
    adult: Image[];
}

export class ImageDetectionService {
    public static async filterImages(images: Image[]): Promise<FilteredImageResults> {
        const clean: Image[] = [];
        const adult: Image[] = [];

        for (const image of images) {
            if (!image.url) {
                continue;
            }

            if (await this.isAdult(image.url)) {
                adult.push(image);
            } else {
                clean.push(image);
            }
        }

        return { clean, adult };
    }

    private static async isAdult(filename: string) {
        const keyFilename = EnvironmentOption.get(EnvironmentOption.SERVICE_CREDENTIALS_FILE_PATH);
        const client = new vision.ImageAnnotatorClient({
            keyFilename,
        });

        const [result] = await client.safeSearchDetection(filename);
        const detections = result.safeSearchAnnotation;

        if (!detections) {
            return false;
        }

        return (
            detections.adult === 'VERY_LIKELY' ||
            detections.adult === 'LIKELY' ||
            detections.adult === 'POSSIBLE'
        );
    }
}
