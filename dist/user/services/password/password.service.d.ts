export declare class PasswordService {
    generate(rawPassword: string): Promise<string>;
    compare(requestPassword: string, hash: string): Promise<boolean>;
}
