import api from '../lib/axios';

let csrfToken: string | null = null;

const csrfService = {
  async getCsrfToken() {
    if (csrfToken) {
      return csrfToken;
    }

    const { data } = await api.get<{ csrfToken: string }>(
      "/csrf-token",
    );

    csrfToken = data.csrfToken;

    return csrfToken;
  }
}

export default csrfService;