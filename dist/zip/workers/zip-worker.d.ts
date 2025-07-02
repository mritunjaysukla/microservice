interface ZipTaskParams {
    fileUrls: string[];
    zipFileName?: string;
}
export default function zipTask(params: ZipTaskParams): Promise<string>;
export {};
