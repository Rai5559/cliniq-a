import Time "mo:base/Time";
import Principal "mo:base/Principal";

module {
    public type Role = { #Patient; #Professional };

    public type Specialization = {
        licenseNumber : Text;
        area : Text;
    };

    public type User = {
        id : Principal;
        username : Text;
        role : Role;
        joinedAt : Time.Time;
        specialization : ?Specialization; // Solo profesionales
    };

    public type Response = {
        responder : Principal;
        content : Text;
        createdAt : Time.Time;
    };

    public type Post = {
        id : Nat;
        title : Text;
        description : Text;
        createdBy : Principal;
        createdAt : Time.Time;
        responses : [Response];
    };

};
