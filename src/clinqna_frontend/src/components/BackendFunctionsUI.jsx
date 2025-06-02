import React, { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";
import { Principal } from "@dfinity/principal";

function BackendFunctionsUI() {
  const { actor, isAuthenticated, principal } = useAuth();
  const [posts, setPosts] = useState([]);
  const [userResult, setUserResult] = useState(null);
  const [postTitle, setPostTitle] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [postId, setPostId] = useState("");
  const [responseContent, setResponseContent] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      if (actor) {
        const result = await actor.getAllPosts();
        setPosts(result);
      }
    };
    fetchPosts();
  }, [actor]);

  const handleCreatePost = async () => {
    if (actor && principal && postTitle && postDesc) {
      const principalObj = Principal.fromText(principal);
      await actor.createPost(postTitle, postDesc, principalObj);
      // Refresca los posts después de crear uno nuevo
      if (actor) {
        const result = await actor.getAllPosts();
        setPosts(result);
      }
    }
  };
  const handleGetUser = async () => {
    if (actor && principal) {
      const principalObj = Principal.fromText(principal);
      const result = await actor.getUser(principalObj);
      setUserResult(result[0]);
    }
  };

  const handleAddResponse = async () => {
    if (actor && postId && responseContent && principal) {
      const principalObj = Principal.fromText(principal);
      await actor.addResponse(Number(postId), principalObj, responseContent);
      // Refresca los posts después de agregar respuesta
      if (actor) {
        const result = await actor.getAllPosts();
        setPosts(result);
      }
    }
  };

  const handleUpdatePost = async (postId, newTitle, newDesc) => {
    if (actor && principal) {
      await actor.updatePost(postId, newTitle ? [newTitle] : [], newDesc ? [newDesc] : []);
      // Refresca los posts después de editar
      const result = await actor.getAllPosts();
      setPosts(result);
    }
  };

  const handleDeletePost = async (postId) => {
    if (actor && principal) {
      await actor.deletePost(postId);
      // Refresca los posts después de borrar
      const result = await actor.getAllPosts();
      setPosts(result);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Id:</h1>
      <pre>{principal ? principal.toString() : "No autenticado"}</pre>
      <h2>Funciones Backend Interactivas</h2>
      <div style={{ marginBottom: 16 }}>
        <input placeholder="Título" value={postTitle} onChange={e => setPostTitle(e.target.value)} />
        <input placeholder="Descripción" value={postDesc} onChange={e => setPostDesc(e.target.value)} />
        <button onClick={handleCreatePost}>Crear Post</button>
      </div>
      <div style={{ marginBottom: 16 }}>
        <button onClick={handleGetUser}>Ver mi usuario</button>
        {userResult && (
          <div style={{ background: '#f6f6f6', padding: 12, borderRadius: 6 }}>
            <div><b>Principal:</b> {userResult.id?.toString?.() || userResult.id}</div>
            <div><b>Username:</b> {userResult.username}</div>
            <div><b>Rol:</b> {userResult.role ? Object.keys(userResult.role)[0] : 'Ninguno'}</div>
            <div><b>Fecha de registro:</b> {new Date(Number(userResult.joinedAt) / 1_000_000).toLocaleString()}</div>
            <div><b>Especialización:</b> {userResult.specialization && userResult.specialization.length > 0 ? (
              <ul>
                {userResult.specialization.map((spec, idx) => (
                  <li key={idx}>{spec.area} (Licencia: {spec.licenseNumber})</li>
                ))}
              </ul>
            ) : 'Ninguna'}
            </div>
          </div>
        )}
      </div>
      <div style={{ marginBottom: 16 }}>
        <input placeholder="ID del post" value={postId} onChange={e => setPostId(e.target.value)} />
        <input placeholder="Respuesta" value={responseContent} onChange={e => setResponseContent(e.target.value)} />
        <button onClick={handleAddResponse}>Agregar respuesta a post</button>
      </div>
      <div>
        <h3>Posts:</h3>
        <ul>
          {posts.map(post => (
            <li key={post.id}>
              <b>{post.title}</b> - {post.description} <span style={{color:'#888'}}>ID: {post.id.toString()}</span>
              {/* Solo el creador puede editar/borrar */}
              {principal && post.createdBy.toString() === principal && (
                <div style={{marginTop: 8}}>
                  <EditDeletePostUI post={post} onUpdate={handleUpdatePost} onDelete={handleDeletePost} />
                </div>
              )}
              <ul>
                {post.responses && post.responses.length > 0 && post.responses.map((r, idx) => (
                  <li key={idx}><i>{r.content}</i> por {r.responder.toString()}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default BackendFunctionsUI;

// Componente para editar/borrar un post
function EditDeletePostUI({ post, onUpdate, onDelete }) {
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [desc, setDesc] = useState(post.description);

  return editMode ? (
    <div>
      <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nuevo título" />
      <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Nueva descripción" />
      <button onClick={() => { onUpdate(post.id, title, desc); setEditMode(false); }}>Guardar</button>
      <button onClick={() => setEditMode(false)}>Cancelar</button>
    </div>
  ) : (
    <>
      <button onClick={() => setEditMode(true)}>Editar</button>
      <button onClick={() => onDelete(post.id)}>Borrar</button>
    </>
  );
}
