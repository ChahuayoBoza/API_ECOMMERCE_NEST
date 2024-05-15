// src/auth/google-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthGuard implements CanActivate {
  private client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  constructor() {
    console.log('Google Client ID:', process.env.GOOGLE_CLIENT_ID);  // Esto imprimirá el ID de cliente en la consola al iniciar el guardia
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.body.token;
    console.log('Token received:', token);  // Imprimir el token recibido
  
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,  // Asegúrate de que este valor es correcto
      });
  
      const payload = ticket.getPayload();
      console.log("Token payload:", payload);  // Imprimir el payload del token
  
      if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
        console.error(`Mismatched audience. Token audience is ${payload.aud}, expected ${process.env.GOOGLE_CLIENT_ID}`);
        throw new UnauthorizedException('Mismatched audience in token');
      }
  
      request.userProfile = {
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        picture: payload.picture
      };
  
      return true;
    } catch (error) {
      console.error("Error al verificar el token:", error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
