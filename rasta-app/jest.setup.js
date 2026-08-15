// Mock Firebase
const mockAuth = {
  currentUser: null,
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
};

const mockDb = {};

// Mock Firebase modules
jest.mock("firebase/auth", () => ({
  getAuth: () => mockAuth,
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  setPersistence: jest.fn(),
  browserSessionPersistence: {},
}));

jest.mock("firebase/firestore", () => ({
  getFirestore: () => mockDb,
  doc: jest.fn(),
  collection: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  arrayUnion: jest.fn(),
  serverTimestamp: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver for viewport hooks
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
