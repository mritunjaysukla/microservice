export default function zipTask({ fileUrls, zipFileName, }: {
    fileUrls: string[];
    zipFileName?: string;
}): Promise<string>;
