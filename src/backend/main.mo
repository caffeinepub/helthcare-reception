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
  let storage = Map.empty<Text, ExternalBlob.ExternalBlob>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let jobApplicantProfiles = Map.empty<Principal, JobApplicantProfile>();
  let userCredentials = Map.empty<Text, UserCredential>();
  let emailToPrincipal = Map.empty<Text, Principal>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type UserCredential = {
    principal : Principal;
    // NOTE: Storing passwords as cleartext for demonstration purposes only. 
    // Proper password hashing must be implemented in production.
    password : Text;
  };

  type Profile = {
    name : Text;
    email : Text;
    phone : Text;
    gender : Gender;
    image : ?ExternalBlob.ExternalBlob;
    role : ?UserRole;
    location : ?Location;
    onboardingCompleted : Bool;
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
    userId : Principal;
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

  // Public registration - no authentication required (guests can register)
  public func registerUser(userProfile : UserProfile, password : Text) : async Principal {
    // Check if email already exists
    if (emailToPrincipal.containsKey(userProfile.email)) {
      Runtime.trap("Email already registered");
    };

    // Create a pseudo-principal based on email for this demo
    // In production, this would be handled differently
    let userPrincipal = Principal.fromText("2vxsx-fae");
    
    // Store credentials
    let credential : UserCredential = {
      principal = userPrincipal;
      password;
    };
    userCredentials.add(userProfile.email, credential);
    emailToPrincipal.add(userProfile.email, userPrincipal);
    
    // Store user profile
    userProfiles.add(userPrincipal, userProfile);
    
    userPrincipal;
  };

  // Public authentication - no authentication required (for login)
  public func authenticateUser(email : Text, password : Text) : async Bool {
    switch (userCredentials.get(email)) {
      case (null) { 
        Runtime.trap("Invalid email or password");
      };
      case (?credential) {
        if (credential.password == password) {
          true;
        } else {
          Runtime.trap("Invalid email or password");
        };
      };
    };
  };

  // Get caller's own profile - requires user permission
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view profiles");
    };
    userProfiles.get(caller);
  };

  // Get another user's profile - requires admin or self
  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  // Save caller's profile - requires user permission
  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Set user role - requires user permission, can only be set once during onboarding
  public shared ({ caller }) func setUserRole(role : UserRole) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can set role");
    };
    
    switch (userProfiles.get(caller)) {
      case (null) { 
        Runtime.trap("User profile not found");
      };
      case (?profile) {
        // Check if role already set
        switch (profile.role) {
          case (?_) { 
            Runtime.trap("Role already set for this user");
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
          };
        };
      };
    };
  };

  // Set user location - requires user permission
  public shared ({ caller }) func setUserLocation(location : Location) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can set location");
    };
    
    switch (userProfiles.get(caller)) {
      case (null) { 
        Runtime.trap("User profile not found");
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
      };
    };
  };

  // Submit job application - requires user permission AND job seeker role
  public shared ({ caller }) func submitJobApplication(location : Location, photo : ExternalBlob.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can submit applications");
    };

    switch (userProfiles.get(caller)) {
      case (null) { 
        Runtime.trap("User profile not found");
      };
      case (?profile) {
        // Verify user has job seeker role
        switch (profile.role) {
          case (?#jobSeeker) {
            // Authorized - proceed with application
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
          };
          case (?#recruiter) {
            Runtime.trap("Unauthorized: Recruiters cannot submit job applications");
          };
          case (null) {
            Runtime.trap("Unauthorized: User role not set");
          };
        };
      };
    };
  };

  // Update job application - requires user permission AND job seeker role AND ownership
  public shared ({ caller }) func updateJobApplication(location : Location, photo : ExternalBlob.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can update applications");
    };

    switch (userProfiles.get(caller)) {
      case (null) { 
        Runtime.trap("User profile not found");
      };
      case (?profile) {
        // Verify user has job seeker role
        switch (profile.role) {
          case (?#jobSeeker) {
            // Verify user owns an application
            switch (jobApplicantProfiles.get(caller)) {
              case (null) {
                Runtime.trap("No application found to update");
              };
              case (?_) {
                // Authorized - update application
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
              };
            };
          };
          case (?#recruiter) {
            Runtime.trap("Unauthorized: Recruiters cannot update job applications");
          };
          case (null) {
            Runtime.trap("Unauthorized: User role not set");
          };
        };
      };
    };
  };

  // Get caller's job application - requires user permission AND job seeker role
  public query ({ caller }) func getMyJobApplication() : async ?JobApplicantProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view applications");
    };

    switch (userProfiles.get(caller)) {
      case (null) { 
        Runtime.trap("User profile not found");
      };
      case (?profile) {
        switch (profile.role) {
          case (?#jobSeeker) {
            jobApplicantProfiles.get(caller);
          };
          case (?#recruiter) {
            Runtime.trap("Unauthorized: Recruiters cannot view job applications this way");
          };
          case (null) {
            Runtime.trap("Unauthorized: User role not set");
          };
        };
      };
    };
  };

  // Search applicants by location - requires user permission AND recruiter role
  public query ({ caller }) func searchApplicantsByLocation(location : Location, _includePhoto : Bool) : async [JobApplicantProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can search applicants");
    };

    switch (userProfiles.get(caller)) {
      case (null) { 
        Runtime.trap("User profile not found");
      };
      case (?profile) {
        // Verify user has recruiter role
        switch (profile.role) {
          case (?#recruiter) {
            // Authorized - search applicants
            let applicants = jobApplicantProfiles.values().toArray().sort(JobApplicantProfile.compareByLocation);
            let filteredApplicants = applicants.filter(
              func(applicant) {
                applicant.location.city == location.city and
                applicant.location.district == location.district and
                applicant.location.state == location.state and
                applicant.location.country == location.country
              }
            );
            filteredApplicants;
          };
          case (?#jobSeeker) {
            Runtime.trap("Unauthorized: Job seekers cannot search for applicants");
          };
          case (null) {
            Runtime.trap("Unauthorized: User role not set");
          };
        };
      };
    };
  };
};
