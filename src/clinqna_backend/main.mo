import Type "types";
import HashMap "mo:base/HashMap";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Hash "mo:base/Hash";

actor {
  // Bases de datos en memoria usando HashMap de la base
  var users = HashMap.HashMap<Principal, Type.User>(0, Principal.equal, Principal.hash);
  var posts = HashMap.HashMap<Nat, Type.Post>(0, Nat.equal, Hash.hash);
  var postIdCounter : Nat = 0;

  // Usuarios
  public shared func registerUser(user: Type.User) : async Bool {
    if (users.get(user.id) != null) {
      return false;
    } else {
      users.put(user.id, user);
      return true;
    }
  };

  public query func getAllUsers() : async [Type.User] {
    Iter.toArray(users.vals())
  };

  public query func getUser(id: Principal) : async ?Type.User {
    users.get(id)
  };

  // Posts
  public shared func createPost(title: Text, description: Text, createdBy: Principal) : async Nat {
    postIdCounter += 1;
    let post : Type.Post = {
      id = postIdCounter;
      title = title;
      description = description;
      createdBy = createdBy;
      createdAt = Time.now();
      responses = [];
    };
    posts.put(post.id, post);
    return post.id;
  };

  public query func getAllPosts() : async [Type.Post] {
    Iter.toArray(posts.vals())
  };

  public query func getPostById(postId: Nat) : async ?Type.Post {
    posts.get(postId)
  };

  public shared func updatePost(postId: Nat, title: ?Text, description: ?Text) : async Bool {
    let postOpt = posts.get(postId);
    switch (postOpt) {
      case null { return false; };
      case (?post) {
        let updatedPost : Type.Post = {
          id = post.id;
          title = switch(title) { case null post.title; case (?t) t };
          description = switch(description) { case null post.description; case (?d) d };
          createdBy = post.createdBy;
          createdAt = post.createdAt;
          responses = post.responses;
        };
        posts.put(postId, updatedPost);
        return true;
      }
    }
  };

  public shared func deletePost(postId: Nat) : async Bool {
    let existed = posts.remove(postId);
    switch (existed) { case null false; case _ true }
  };

  // Respuestas
  public shared func addResponse(postId: Nat, responder: Principal, content: Text) : async Bool {
    let postOpt = posts.get(postId);
    switch (postOpt) {
      case null { return false; };
      case (?post) {
        let response : Type.Response = {
          responder = responder;
          content = content;
          createdAt = Time.now();
        };
        let updatedPost : Type.Post = {
          id = post.id;
          title = post.title;
          description = post.description;
          createdBy = post.createdBy;
          createdAt = post.createdAt;
          responses = Array.append(post.responses, [response]);
        };
        posts.put(postId, updatedPost);
        return true;
      }
    }
  };

  public query func getResponses(postId: Nat) : async ?[Type.Response] {
    let postOpt = posts.get(postId);
    switch (postOpt) {
      case null { null };
      case (?post) { ?post.responses };
    }
  };

  // Mock de posts para pruebas
  public func mockPosts() : async () {
    let now = Time.now();
    let post1 : Type.Post = {
      id = 1;
      title = "Primer post de prueba";
      description = "Este es un post de ejemplo para pruebas.";
      createdBy = Principal.fromText("aaaaa-aa");
      createdAt = now;
      responses = [];
    };
    let post2 : Type.Post = {
      id = 2;
      title = "Segundo post de prueba";
      description = "Otro post de ejemplo para el frontend.";
      createdBy = Principal.fromText("aaaaa-aa");
      createdAt = now;
      responses = [];
    };
    posts.put(post1.id, post1);
    postIdCounter += 1; 
    posts.put(post2.id, post2);
    postIdCounter += 1;
  };
}