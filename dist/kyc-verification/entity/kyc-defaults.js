"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultTermsAndSubmission = exports.defaultBusinessInformation = exports.defaultIdentityVerification = exports.defaultBasicInformation = void 0;
exports.defaultBasicInformation = {
    fullName: '',
    dob: new Date(),
    gender: '',
    label: '',
    contactNumber: '',
    country: '',
    city: '',
    address: '',
    profilePicture: '',
};
exports.defaultIdentityVerification = {
    idType: '',
    idFront: '',
    idBack: '',
    idNumber: '',
};
exports.defaultBusinessInformation = {
    businessName: '',
    businessType: '',
    panNumber: '',
    panDocument: '',
    businessAddress: '',
    hasBusiness: false,
};
exports.defaultTermsAndSubmission = {
    terms: [],
    acceptance: false,
};
//# sourceMappingURL=kyc-defaults.js.map