"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../auth/AuthProvider"
import { Principal } from "@dfinity/principal"
import { Heart, MessageCircle, Plus, Search, Stethoscope, UserCheck, Edit3, Trash2, Send, Clock } from "lucide-react"

function BackendFunctionsUI() {
  const { actor, isAuthenticated, principal, user, login } = useAuth()
  const [posts, setPosts] = useState([])
  const [userResult, setUserResult] = useState(null)
  const [postTitle, setPostTitle] = useState("")
  const [postDesc, setPostDesc] = useState("")
  const [postId, setPostId] = useState("")
  const [responseContent, setResponseContent] = useState("")
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPostId, setSelectedPostId] = useState(null)

  useEffect(() => {
    const fetchPosts = async () => {
      if (actor) {
        const result = await actor.getAllPosts()
        setPosts(result)
      }
    }
    fetchPosts()
  }, [actor])

  const handleCreatePost = async () => {
    if (actor && principal && postTitle && postDesc) {
      const principalObj = Principal.fromText(principal)
      await actor.createPost(postTitle, postDesc, principalObj)
      // Refresca los posts después de crear uno nuevo
      if (actor) {
        const result = await actor.getAllPosts()
        setPosts(result)
      }
      setPostTitle("")
      setPostDesc("")
      setShowCreatePost(false)
    }
  }

  const handleGetUser = async () => {
    if (actor && principal) {
      const principalObj = Principal.fromText(principal)
      const result = await actor.getUser(principalObj)
      setUserResult(result[0])
    }
  }

  const handleAddResponse = async (postIdToRespond) => {
    if (actor && responseContent && principal) {
      const principalObj = Principal.fromText(principal)
      await actor.addResponse(Number(postIdToRespond), principalObj, responseContent)
      // Refresca los posts después de agregar respuesta
      if (actor) {
        const result = await actor.getAllPosts()
        setPosts(result)
      }
      setResponseContent("")
      setSelectedPostId(null)
    }
  }

  const handleUpdatePost = async (postId, newTitle, newDesc) => {
    if (actor && principal) {
      await actor.updatePost(postId, newTitle ? [newTitle] : [], newDesc ? [newDesc] : [])
      // Refresca los posts después de editar
      const result = await actor.getAllPosts()
      setPosts(result)
    }
  }

  const handleDeletePost = async (postId) => {
    if (actor && principal) {
      await actor.deletePost(postId)
      // Refresca los posts después de borrar
      const result = await actor.getAllPosts()
      setPosts(result)
    }
  }

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "Fecha desconocida"

    // Convertir BigInt a número si es necesario
    const timeMs = typeof timestamp === "bigint" ? Number(timestamp) / 1_000_000 : new Date(timestamp).getTime()

    const now = Date.now()
    const diffInHours = Math.floor((now - timeMs) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Hace menos de 1 hora"
    if (diffInHours === 1) return "Hace 1 hora"
    if (diffInHours < 24) return `Hace ${diffInHours} horas`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "Hace 1 día"
    return `Hace ${diffInDays} días`
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <div className="card mb-6">
          <div className="card-header">
            <h3 className="card-title text-lg">Acciones Rápidas</h3>
          </div>
          <div className="card-content space-y-3">
            {isAuthenticated ? (
              <>
                <button onClick={() => setShowCreatePost(true)} className="button button-primary w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Nueva Consulta
                </button>
                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-600">Verificado</span>
                    </div>
                    {user?.specialization &&
                      user.specialization.map((spec, idx) => (
                        <span key={idx} className="badge badge-secondary text-xs">
                          {spec.area}
                        </span>
                      ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-4">
                <Heart className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-3">Inicia sesión para hacer consultas y responder preguntas</p>
                <button onClick={login} className="button button-primary button-sm">
                  Iniciar Sesión
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title text-lg">Estadísticas</h3>
          </div>
          <div className="card-content">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total consultas</span>
                <span className="font-semibold">{posts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Respondidas</span>
                <span className="font-semibold text-green-600">
                  {posts.filter((p) => p.responses && p.responses.length > 0).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Pendientes</span>
                <span className="font-semibold text-orange-600">
                  {posts.filter((p) => !p.responses || p.responses.length === 0).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {isAuthenticated && (
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="card-title text-lg">Mi Perfil</h3>
            </div>
            <div className="card-content">
              <button onClick={handleGetUser} className="button button-outline w-full">
                Ver mi información
              </button>
              {userResult && (
                <div className="mt-4 space-y-2">
                  <div>
                    <b>Principal:</b> {userResult.id?.toString?.() || userResult.id}
                  </div>
                  <div>
                    <b>Username:</b> {userResult.username}
                  </div>
                  <div>
                    <b>Rol:</b> {userResult.role ? Object.keys(userResult.role)[0] : "Ninguno"}
                  </div>
                  <div>
                    <b>Fecha de registro:</b> {formatTimeAgo(userResult.joinedAt)}
                  </div>
                  <div>
                    <b>Especialización:</b>
                    {userResult.specialization && userResult.specialization.length > 0 ? (
                      <ul className="list-disc pl-5 mt-1">
                        {userResult.specialization.map((spec, idx) => (
                          <li key={idx}>
                            {spec.area} (Licencia: {spec.licenseNumber})
                          </li>
                        ))}
                      </ul>
                    ) : (
                      " Ninguna"
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
        {/* Search Bar */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar consultas médicas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>

        {/* Create Post Form */}
        {showCreatePost && (
          <div className="card mb-6 border-blue-200 bg-blue-50">
            <div className="card-header">
              <h3 className="card-title text-lg text-blue-900">Nueva Consulta Médica</h3>
              <p className="card-description">Describe tu consulta de manera clara y detallada</p>
            </div>
            <div className="card-content space-y-4">
              <input
                type="text"
                placeholder="Título de la consulta"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="input w-full"
              />
              <textarea
                placeholder="Describe tu consulta médica con el mayor detalle posible..."
                value={postDesc}
                onChange={(e) => setPostDesc(e.target.value)}
                rows={4}
                className="textarea w-full"
              />
              <div className="flex space-x-3">
                <button onClick={handleCreatePost} className="button button-primary">
                  <Send className="h-4 w-4 mr-2" />
                  Publicar Consulta
                </button>
                <button onClick={() => setShowCreatePost(false)} className="button button-outline">
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className="card hover:shadow-md transition-shadow">
                <div className="card-header">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="card-title text-lg text-gray-900 mb-2">{post.title}</h3>
                      <p className="card-description text-gray-600 leading-relaxed">{post.description}</p>
                    </div>
                    {(!post.responses || post.responses.length === 0) && (
                      <span className="badge badge-outline text-orange-600 border-orange-200">Sin responder</span>
                    )}
                  </div>
                </div>

                <div className="card-content">
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatTimeAgo(post.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="h-4 w-4" />
                        <span>
                          {post.responses ? post.responses.length : 0} respuesta
                          {post.responses && post.responses.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    {isAuthenticated && post.createdBy.toString() === principal && (
                      <EditDeletePostUI post={post} onUpdate={handleUpdatePost} onDelete={handleDeletePost} />
                    )}
                  </div>

                  {/* Responses */}
                  {post.responses && post.responses.length > 0 && (
                    <div className="space-y-4">
                      <hr className="separator" />
                      <div className="space-y-3">
                        {post.responses.map((response, idx) => (
                          <div key={idx} className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <div className="flex items-start space-x-3">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <Stethoscope className="h-4 w-4 text-green-600" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="font-medium text-green-900">{response.responder.toString()}</span>
                                  <span className="badge badge-secondary text-xs bg-green-100 text-green-700">
                                    Profesional
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm leading-relaxed">{response.content}</p>
                                <p className="text-xs text-gray-500 mt-2">{formatTimeAgo(response.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add Response */}
                  {isAuthenticated && (
                    <div className="mt-4">
                      <hr className="separator mb-4" />
                      <div className="space-y-3">
                        <textarea
                          placeholder="Escribe tu respuesta profesional..."
                          value={selectedPostId === post.id ? responseContent : ""}
                          onChange={(e) => {
                            setSelectedPostId(post.id)
                            setResponseContent(e.target.value)
                          }}
                          rows={3}
                          className="textarea w-full"
                        />
                        <button
                          onClick={() => handleAddResponse(post.id)}
                          className="button button-success button-sm"
                          disabled={!responseContent.trim() || selectedPostId !== post.id}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Responder
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="card">
              <div className="card-content text-center py-12">
                <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron consultas</h3>
                <p className="text-gray-500">
                  {searchTerm ? "Intenta con otros términos de búsqueda" : "Sé el primero en hacer una consulta"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente para editar/borrar un post
function EditDeletePostUI({ post, onUpdate, onDelete }) {
  const [editMode, setEditMode] = useState(false)
  const [title, setTitle] = useState(post.title)
  const [desc, setDesc] = useState(post.description)

  return editMode ? (
    <div className="mt-4 space-y-3">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Nuevo título"
        className="input w-full"
      />
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Nueva descripción"
        className="textarea w-full"
      />
      <div className="flex space-x-2">
        <button
          onClick={() => {
            onUpdate(post.id, title, desc)
            setEditMode(false)
          }}
          className="button button-primary button-sm"
        >
          Guardar
        </button>
        <button onClick={() => setEditMode(false)} className="button button-outline button-sm">
          Cancelar
        </button>
      </div>
    </div>
  ) : (
    <div className="flex space-x-2">
      <button onClick={() => setEditMode(true)} className="button button-ghost button-sm">
        <Edit3 className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(post.id)}
        className="button button-ghost button-sm text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  )
}

export default BackendFunctionsUI
