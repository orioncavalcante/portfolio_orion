import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeToggle } from './components/ui/ThemeToggle';

// Páginas
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

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
                        <Route 
                            path="*" 
                            element={
                                <div className="min-h-screen flex flex-col items-center justify-center dark:bg-zinc-900 font-mono p-6 text-center">
                                    <h1 className="text-9xl font-black text-[#DE1B1B] border-4 border-black bg-[#FEF08A] p-4 shadow-[8px_8px_0px_#000] mb-6">404</h1>
                                    <p className="font-bold text-xl dark:text-white mb-4">Página não encontrada!</p>
                                    <a href="/" className="bg-black text-white p-3 border-2 border-black hover:bg-[#DE1B1B] transition-colors">VOLTAR AO INÍCIO</a>
                                </div>
                            } 
                        />
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </AuthProvider>
    );
}