'use client';

import { useState } from 'react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Ingresa un formato de correo válido'),
  pass: z.string().min(6, 'La contraseña debe tener mínimo 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({ email: '', pass: '' });
  const [errors, setErrors] = useState<{ email?: string; pass?: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: { email?: string; pass?: string } = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as 'email' | 'pass';
        fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al autenticar');
      }

      setToken(data.access_token);
      setUserData(data.user);
    } catch (err: any) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUserData(null);
    setToken(null);
    setFormData({ email: '', pass: '' });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* Vista 1: Pantalla de Perfil (cuando ya inició sesión) */}
      {userData ? (
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl uppercase">
              {userData.username ? userData.username.charAt(0) : 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Panel de Usuario</h2>
              <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                ● Sesión activa
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block">ID de Usuario</span>
              <p className="text-sm font-mono text-gray-800 break-all">{userData.id}</p>
            </div>

            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block">Nombre de Usuario</span>
              <p className="text-sm font-semibold text-gray-800">{userData.username}</p>
            </div>

            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block">Correo Electrónico</span>
              <p className="text-sm text-gray-800">{userData.email}</p>
            </div>

            <div>
              <span className="text-xs text-gray-500 uppercase tracking-wider block">Token JWT</span>
              <p className="text-xs font-mono text-gray-600 bg-gray-200 p-2 rounded break-all select-all">
                {token}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      ) : (
        /* Vista 2: Formulario de Login (cuando NO hay sesión activa) */
        <div className="w-full max-w-md bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Inicio de Sesión
          </h1>

          {serverError && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="text"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="carlos@prueba.edu.mx"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black border-gray-300"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                name="pass"
                value={formData.pass}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black border-gray-300"
              />
              {errors.pass && (
                <p className="text-red-500 text-xs mt-1">{errors.pass}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Verificando credenciales...' : 'Iniciar Sesión'}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}