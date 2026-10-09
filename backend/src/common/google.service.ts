import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, type Auth, Common } from 'googleapis';
import { GoogleError } from '../types';
import { GetAuthUrl } from '../modules/auth/auth.validation';

@Injectable()
export class GoogleService {
  private oauth2Client: Auth.OAuth2Client;
  private authRedirect: string;
  private settingRedirect: string;

  constructor(config: ConfigService) {
    this.authRedirect = `${config.getOrThrow('CLIENT_URL')}/auth/third-party-login`;
    this.settingRedirect = `${config.getOrThrow('CLIENT_URL')}/user/settings`;
    this.oauth2Client = new google.auth.OAuth2({
      client_id: config.getOrThrow('GOOGLE_CLIENT_ID'),
      client_secret: config.getOrThrow('GOOGLE_CLIENT_SECRET'),
      redirect_uris: [this.authRedirect, this.settingRedirect],
    });
  }

  generateAuthUrl(state: string, mode: GetAuthUrl['mode']) {
    const scopes = [
      // 'https://www.googleapis.com/auth/user.birthday.read',
      // 'https://www.googleapis.com/auth/user.gender.read',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ];

    const authorizationUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      include_granted_scopes: true,
      prompt: 'consent',
      state: state,
      redirect_uri:
        mode === 'connect' ? this.settingRedirect : this.authRedirect,
    });

    return authorizationUrl;
  }

  async getToken(code: string, mode: GetAuthUrl['mode']) {
    try {
      const { tokens } = await this.oauth2Client.getToken({
        code,
        redirect_uri:
          mode === 'connect' ? this.settingRedirect : this.authRedirect,
      });
      return tokens;
    } catch (error) {
      if (error instanceof Common.GaxiosError) {
        console.log(error.response);
        if (error.response) {
          const googleError = error.response.data as GoogleError;
          throw new BadRequestException(
            googleError.error_description || googleError.error,
          );
        } else {
          throw new BadRequestException(
            `No response received from Google: ${error.message}`,
          );
        }
      }

      throw error;
    }
  }

  setCredential(credentials: Auth.Credentials) {
    this.oauth2Client.setCredentials(credentials);
  }

  async getProfile() {
    try {
      const request = google.oauth2({
        version: 'v2',
        auth: this.oauth2Client,
      });
      const profile = await request.userinfo.get();
      return profile.data;
    } catch (error) {
      if (error instanceof Common.GaxiosError) {
        if (error.response) {
          const googleError = error.response.data as GoogleError;
          throw new BadRequestException(
            googleError.error_description || googleError.error,
          );
        } else {
          throw new BadRequestException(
            `No response received from Google: ${error.message}`,
          );
        }
      }

      throw error;
    }
  }
}
