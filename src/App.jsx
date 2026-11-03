import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeToggle } from './components/ui/ThemeToggle';

// Páginas
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';

// Componente para proteger rotas (Só passa quem tem `user`)
function RotaProtegida({ children }) {
    const { user, loadingAuth } = useAuth();

    if (loadingAuth) return <div className="min-h-screen flex items-center justify-center dark:bg-zinc-900 font-mono font-bold dark:text-white">CARREGANDO...</div>;
    
    // Se não tiver logado, expulsa para o login
    if (!user) return <Navigate to="/login" />;
    
    return children;
}

export default function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <ThemeToggle />
                
                {/* O BrowserRouter controla as URLs lá em cima no navegador */}
                <BrowserRouter>
                    <Routes>
                        {/* Rota principal do seu Portfólio */}
                        <Route path="/" element={<Home />} />
                        
                        {/* Rota de Login */}
                        <Route path="/login" element={<Login />} />
                        
                        {/* Rota do Dashboard (Protegida!) */}
                        <Route 
                            path="/dashboard" 
                            element={
                                <RotaProtegida>
                                    <Dashboard />
                                </RotaProtegida>
                            } 
                        />
                        
                        {/* Requisito 1: Página amigável para Rota Inexistente (404) */}
                        <Route path="*" element={<NotFound />} />
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </AuthProvider>
    );
}
