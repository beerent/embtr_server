import vision from '@google-cloud/vision';
import { Image } from '@resources/schema';
import { logger } from '@src/common/logger/Logger';
import { EnvironmentOption } from '@src/utility/environment/EnvironmentUtility';

export interface FilteredImageResults<T extends string | Image> {
    clean: T[];
    adult: T[];
}

export class ImageDetectionService {
    public static async filterUrlImage(image: string): Promise<string | undefined> {
        if (await this.isAdult(image)) {
            return undefined;
        }

        return image;
    }

    public static async filterUrlImages(images: string[]): Promise<FilteredImageResults<string>> {
        const clean: string[] = [];
        const adult: string[] = [];

        for (const image of images) {
            if (await this.isAdult(image)) {
                adult.push(image);
            } else {
                clean.push(image);
            }
        }

        return { clean, adult };
    }

    public static async filterImages(images: Image[]): Promise<FilteredImageResults<Image>> {
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
        if (!keyFilename) {
            logger.error('Service credentials file path is not set');
            return false;
        }

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
