import Text "mo:core/Text";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import MixinStorage "blob-storage/Mixin";
import ExternalBlob "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  type UserCredential = {
    principal : Principal.Principal;
    password : Text;
  };

  type Gender = {
    #male;
    #female;
    #other;
  };

  type UserRole = {
    #jobSeeker;
    #recruiter;
  };

  type Location = {
    city : Text;
    district : Text;
    state : Text;
    country : Text;
  };

  public type UserProfile = {
    name : Text;
    email : Text;
    phone : Text;
    gender : Gender;
    role : ?UserRole;
    location : ?Location;
    onboardingCompleted : Bool;
  };

  public type JobApplicantProfile = {
    userId : Principal.Principal;
    name : Text;
    email : Text;
    phone : Text;
    gender : Gender;
    location : Location;
    photo : ?ExternalBlob.ExternalBlob;
  };

  module JobApplicantProfile {
    public func compareByLocation(a : JobApplicantProfile, b : JobApplicantProfile) : Order.Order {
      Text.compare(a.location.city, b.location.city);
    };
  };

  type Error = {
    #alreadyRegistered;
    #invalidCredentials;
    #unauthorized;
    #profileNotFound;
    #roleAlreadySet;
    #noApplicationFound;
    #roleNotSet;
    #recruiterCannotApply;
    #jobSeekerCannotSearch;
  };

  public type RegisterResult = {
    #ok : Principal.Principal;
    #err : Error;
  };

  public type AuthResult = {
    #ok;
    #err : Error;
  };

  public type ProfileResult = {
    #ok : UserProfile;
    #err : Error;
  };

  public type JobApplicationResult = {
    #ok : JobApplicantProfile;
    #err : Error;
  };

  public type JobApplicationsResult = {
    #ok : [JobApplicantProfile];
    #err : Error;
  };

  public type VoidResult = {
    #ok;
    #err : Error;
  };

  // Internal map of principals to emails for reverse lookups (used for getCallerUserProfile)
  let principalToEmail = Map.empty<Principal.Principal, Text>();

  // Email to credential mapping for authentication
  let userCredentials = Map.empty<Text, UserCredential>();

  // Principal to user profiles
  let userProfiles = Map.empty<Principal.Principal, UserProfile>();

  // Principal to job application profiles
  let jobApplicantProfiles = Map.empty<Principal.Principal, JobApplicantProfile>();

  // Initialize authentication system
  let accessControlState = AccessControl.initState();

  // Mixins for blob storage, file management, and authorization
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public shared ({ caller }) func registerUser(userProfile : UserProfile, password : Text) : async RegisterResult {
    switch (userCredentials.get(userProfile.email)) {
      case (?_) {
        return #err(#alreadyRegistered);
      };
      case (null) {
        // Create and store user credential
        let newCredential : UserCredential = {
          principal = caller;
          password;
        };
        userCredentials.add(userProfile.email, newCredential);

        // Store user profile
        userProfiles.add(caller, userProfile);

        // Map principal to email for reverse lookup
        principalToEmail.add(caller, userProfile.email);

        // Assign #user role to the newly registered principal
        // This integrates email/password auth with the AccessControl system
        AccessControl.assignRole(accessControlState, caller, caller, #user);

        return #ok(caller);
      };
    };
  };

  public shared ({ caller }) func authenticateUser(email : Text, password : Text) : async AuthResult {
    switch (userCredentials.get(email)) {
      case (null) {
        return #err(#invalidCredentials);
      };
      case (?credential) {
        if (credential.password != password) {
          return #err(#invalidCredentials);
        };

        // Ensure principal-email mapping exists
        principalToEmail.add(credential.principal, email);

        // Ensure the authenticated principal has #user role
        // This allows subsequent calls from this principal to pass authorization checks
        AccessControl.assignRole(accessControlState, credential.principal, credential.principal, #user);

        #ok;
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return null;
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal.Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      return null;
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func setUserRole(role : UserRole) : async VoidResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#unauthorized);
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        #err(#profileNotFound);
      };
      case (?profile) {
        // Check if role already set
        switch (profile.role) {
          case (?_) {
            #err(#roleAlreadySet);
          };
          case (null) {
            let updatedProfile : UserProfile = {
              name = profile.name;
              email = profile.email;
              phone = profile.phone;
              gender = profile.gender;
              role = ?role;
              location = profile.location;
              onboardingCompleted = profile.onboardingCompleted;
            };
            userProfiles.add(caller, updatedProfile);
            #ok;
          };
        };
      };
    };
  };

  public shared ({ caller }) func setUserLocation(location : Location) : async VoidResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#unauthorized);
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        #err(#profileNotFound);
      };
      case (?profile) {
        let updatedProfile : UserProfile = {
          name = profile.name;
          email = profile.email;
          phone = profile.phone;
          gender = profile.gender;
          role = profile.role;
          location = ?location;
          onboardingCompleted = true;
        };
        userProfiles.add(caller, updatedProfile);
        #ok;
      };
    };
  };

  public shared ({ caller }) func submitJobApplication(location : Location, photo : ExternalBlob.ExternalBlob) : async VoidResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#unauthorized);
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        #err(#profileNotFound);
      };
      case (?profile) {
        switch (profile.role) {
          case (?#jobSeeker) {
            let jobApplicant : JobApplicantProfile = {
              userId = caller;
              name = profile.name;
              email = profile.email;
              phone = profile.phone;
              gender = profile.gender;
              location;
              photo = ?photo;
            };
            jobApplicantProfiles.add(caller, jobApplicant);
            #ok;
          };
          case (?#recruiter) {
            #err(#recruiterCannotApply);
          };
          case (null) {
            #err(#roleNotSet);
          };
        };
      };
    };
  };

  public shared ({ caller }) func updateJobApplication(location : Location, photo : ExternalBlob.ExternalBlob) : async VoidResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#unauthorized);
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        #err(#profileNotFound);
      };
      case (?profile) {
        switch (profile.role) {
          case (?#jobSeeker) {
            switch (jobApplicantProfiles.get(caller)) {
              case (null) {
                #err(#noApplicationFound);
              };
              case (?_) {
                let updatedApplicant : JobApplicantProfile = {
                  userId = caller;
                  name = profile.name;
                  email = profile.email;
                  phone = profile.phone;
                  gender = profile.gender;
                  location;
                  photo = ?photo;
                };
                jobApplicantProfiles.add(caller, updatedApplicant);
                #ok;
              };
            };
          };
          case (?#recruiter) {
            #err(#recruiterCannotApply);
          };
          case (null) {
            #err(#roleNotSet);
          };
        };
      };
    };
  };

  public query ({ caller }) func getMyJobApplication() : async JobApplicationResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#unauthorized);
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        #err(#profileNotFound);
      };
      case (?profile) {
        switch (profile.role) {
          case (?#jobSeeker) {
            switch (jobApplicantProfiles.get(caller)) {
              case (null) {
                #err(#noApplicationFound);
              };
              case (?applicant) {
                #ok(applicant);
              };
            };
          };
          case (?#recruiter) {
            #err(#recruiterCannotApply);
          };
          case (null) {
            #err(#roleNotSet);
          };
        };
      };
    };
  };

  public query ({ caller }) func searchApplicantsByLocation(location : Location, _includePhoto : Bool) : async JobApplicationsResult {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      return #err(#unauthorized);
    };

    switch (userProfiles.get(caller)) {
      case (null) {
        #err(#profileNotFound);
      };
      case (?profile) {
        switch (profile.role) {
          case (?#recruiter) {
            let applicants = jobApplicantProfiles.values().toArray().sort(JobApplicantProfile.compareByLocation);
            let filteredApplicants = applicants.filter(
              func(applicant) {
                applicant.location.city == location.city and applicant.location.district == location.district and applicant.location.state == location.state and applicant.location.country == location.country
              }
            );
            #ok(filteredApplicants);
          };
          case (?#jobSeeker) {
            #err(#jobSeekerCannotSearch);
          };
          case (null) {
            #err(#roleNotSet);
          };
        };
      };
    };
  };
};
