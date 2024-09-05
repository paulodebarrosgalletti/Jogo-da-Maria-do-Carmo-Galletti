// Importando as funções necessárias do Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// Importar getAnalytics se você realmente precisar usar Analytics
import { getAnalytics } from "firebase/analytics";

// Configuração do Firebase com as suas credenciais do projeto
const firebaseConfig = {
  apiKey: "AIzaSyBMXdQQoWMBpOKmfEiH3lSNSudGnVKM_-s",
  authDomain: "mariadocarmo-b2ac0.firebaseapp.com",
  projectId: "mariadocarmo-b2ac0",
  storageBucket: "mariadocarmo-b2ac0.appspot.com",
  messagingSenderId: "791895053339",
  appId: "1:791895053339:web:71c6e40e9e4124784994be",
  measurementId: "G-CTLZ2TMENV",
};

// Inicializando o Firebase com as configurações acima
const app = initializeApp(firebaseConfig);

// Inicializar Auth para autenticação
const auth = getAuth(app);

// Inicializar Firestore para banco de dados
const db = getFirestore(app);

// Opcional: Inicializar Analytics (apenas se realmente for usar)
const analytics = getAnalytics(app);

// Exportando os serviços que você vai utilizar
export { auth, db, analytics };
