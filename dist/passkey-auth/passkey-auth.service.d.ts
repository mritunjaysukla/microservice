import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import { AuthService } from 'src/user/services/auth/auth.service';
import { UserService } from 'src/user/services/user/user.service';
export declare class PasskeyAuthService {
    private readonly userRepository;
    private readonly authService;
    private readonly userService;
    constructor(userRepository: Repository<User>, authService: AuthService, userService: UserService);
    private rpName;
    private rpID;
    private origin;
    private safeDecodeClientDataJSON;
    generateRegistrationOptions(userId: string): Promise<import("@simplewebauthn/server").PublicKeyCredentialCreationOptionsJSON>;
    verifyRegistrationResponse(response: any, expectedChallenge: string): Promise<{
        credentialID: string;
        credentialPublicKeyBase64: string;
        counter: number;
    }>;
    generateAuthenticationOptions(): Promise<import("@simplewebauthn/server").PublicKeyCredentialRequestOptionsJSON>;
    verifyAuthenticationResponse(response: any, expectedChallenge: string): Promise<string>;
}
