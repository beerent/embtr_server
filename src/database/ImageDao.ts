import { Image } from '@resources/schema';
import { storage } from '@src/auth/Firebase';

export class ImageDao {
    public static async deleteImages(image: Image[]) {
        for (const imageToDelete of image) {
            await this.deleteImage(imageToDelete);
        }
    }

    public static async deleteImage(image: Image) {
        if (!image.url) {
            return;
        }

        // get string after 'embtr-app.appspot.com/' and replace all %2F with / and remove everything from ? on
        const bucketUrl = image.url
            .split('embtr-app.appspot.com/o/')[1]
            .replace(/%2F/g, '/')
            .split('?')[0];

        try {
            await storage.bucket('embtr-app.appspot.com').file(bucketUrl).delete();
        } catch (e) {
            console.log(e);
        }
    }
}
