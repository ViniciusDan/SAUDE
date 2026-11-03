export type AuthCredentials = {
  cpf: string;
  password: string;
};

export type AuthenticatedUser = {
  id: string;
  name: string;
  cpf: string;
  token: string;
};


