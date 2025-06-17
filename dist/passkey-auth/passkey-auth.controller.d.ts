import { PasskeyAuthService } from './passkey-auth.service';
export declare class PasskeyAuthController {
    private readonly passkeyAuthService;
    constructor(passkeyAuthService: PasskeyAuthService);
    generateRegistrationOptions(userId: string): Promise<{
        registrationOptions: import("@simplewebauthn/server").PublicKeyCredentialCreationOptionsJSON;
    }>;
    verifyRegistrationResponse(response: any, expectedChallenge: string): Promise<{
        credentialID: string;
        credentialPublicKeyBase64: string;
        counter: number;
    }>;
    generateAuthenticationOptions(): Promise<{
        authOptions: import("@simplewebauthn/server").PublicKeyCredentialRequestOptionsJSON;
    }>;
    verifyAuthenticationResponse(response: any, expectedChallenge: string): Promise<{
        newCounter: string;
    }>;
}
