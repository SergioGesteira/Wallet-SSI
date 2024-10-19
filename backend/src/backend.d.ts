
import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    nonce: string;  // Aquí defines que el nonce es una cadena de texto
  }
}
