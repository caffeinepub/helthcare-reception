import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Location {
    country: string;
    city: string;
    district: string;
    state: string;
}
export type Principal = Principal;
export type JobApplicationResult = {
    __kind__: "ok";
    ok: JobApplicantProfile;
} | {
    __kind__: "err";
    err: Error_;
};
export interface JobApplicantProfile {
    userId: Principal;
    name: string;
    email: string;
    gender: Gender;
    phone: string;
    photo?: ExternalBlob;
    location: Location;
}
export type RegisterResult = {
    __kind__: "ok";
    ok: Principal;
} | {
    __kind__: "err";
    err: Error_;
};
export type VoidResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type JobApplicationsResult = {
    __kind__: "ok";
    ok: Array<JobApplicantProfile>;
} | {
    __kind__: "err";
    err: Error_;
};
export type AuthResult = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface UserProfile {
    name: string;
    role?: UserRole;
    email: string;
    gender: Gender;
    onboardingCompleted: boolean;
    phone: string;
    location?: Location;
}
export enum Error_ {
    roleNotSet = "roleNotSet",
    recruiterCannotApply = "recruiterCannotApply",
    noApplicationFound = "noApplicationFound",
    alreadyRegistered = "alreadyRegistered",
    jobSeekerCannotSearch = "jobSeekerCannotSearch",
    unauthorized = "unauthorized",
    invalidCredentials = "invalidCredentials",
    roleAlreadySet = "roleAlreadySet",
    profileNotFound = "profileNotFound"
}
export enum Gender {
    other = "other",
    female = "female",
    male = "male"
}
export enum UserRole {
    jobSeeker = "jobSeeker",
    recruiter = "recruiter"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    authenticateUser(email: string, password: string): Promise<AuthResult>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getMyJobApplication(): Promise<JobApplicationResult>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(userProfile: UserProfile, password: string): Promise<RegisterResult>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchApplicantsByLocation(location: Location, _includePhoto: boolean): Promise<JobApplicationsResult>;
    setUserLocation(location: Location): Promise<VoidResult>;
    setUserRole(role: UserRole): Promise<VoidResult>;
    submitJobApplication(location: Location, photo: ExternalBlob): Promise<VoidResult>;
    updateJobApplication(location: Location, photo: ExternalBlob): Promise<VoidResult>;
}
