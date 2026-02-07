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
export interface JobApplicantProfile {
    userId: Principal;
    name: string;
    email: string;
    gender: Gender;
    phone: string;
    photo?: ExternalBlob;
    location: Location;
}
export interface UserProfile {
    name: string;
    role?: UserRole;
    email: string;
    gender: Gender;
    onboardingCompleted: boolean;
    phone: string;
    location?: Location;
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
    authenticateUser(email: string, password: string): Promise<boolean>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getMyJobApplication(): Promise<JobApplicantProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    registerUser(userProfile: UserProfile, password: string): Promise<Principal>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchApplicantsByLocation(location: Location, _includePhoto: boolean): Promise<Array<JobApplicantProfile>>;
    setUserLocation(location: Location): Promise<void>;
    setUserRole(role: UserRole): Promise<void>;
    submitJobApplication(location: Location, photo: ExternalBlob): Promise<void>;
    updateJobApplication(location: Location, photo: ExternalBlob): Promise<void>;
}
