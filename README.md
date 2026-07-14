# ADCESP — Portal e CMS

Sistema web da **ADCESP — Secção Sindical dos Docentes da UESPI**, composto por:

- **Portal Público** (SEO + performance): histórico, notícias, "Saiu na Imprensa", transparência, eventos, serviços, filiação, quem somos e eleições.
- **Painel Administrativo** (`/admin`): CMS protegido por autenticação para gerenciar todo o conteúdo.

## 🧰 Stack

| Camada        | Tecnologia                                  |
| ------------- | ------------------------------------------- |
| Framework     | Next.js 14 (App Router) + TypeScript        |
| Estilo        | Tailwind CSS + componentes shadcn/ui        |
| Ícones        | Lucide React                                |
| Banco         | PostgreSQL + Prisma ORM                     |
| Autenticação  | NextAuth.js (Auth.js) — Credentials + JWT   |
| Validação     | Zod                                         |
| Gráficos      | Recharts                                    |
| Notificações  | Sonner                                      |

## 🚀 Como rodar (desenvolvimento)

### 1. Pré-requisitos
- Node.js 18.18+ (recomendado 20+)
- PostgreSQL em execução localmente

### 2. Banco de dados
Crie o banco `adcesp` no PostgreSQL:

```sql
CREATE DATABASE adcesp;
```

> **Atenção a caracteres especiais na senha:** `@`, `:` e `/` são reservados na
> URL de conexão e precisam ser **URL-encoded** (ex.: `@` vira `%40`):
>
> ```env
> DATABASE_URL="postgresql://postgres:SUA%40SENHA@localhost:5432/adcesp?schema=public"
> ```

### 3. Variáveis de ambiente
Copie `.env.example` para `.env` e ajuste. Gere um `NEXTAUTH_SECRET` forte:

```bash
# Linux/macOS
openssl rand -base64 32
# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Max 256 }))
```

Variáveis obrigatórias: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
`NEXT_PUBLIC_SITE_URL`, `STORAGE_PATH`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

### 4. Instalar dependências

```bash
npm install     # o postinstall roda `prisma generate`
```

### 5. Criar as tabelas e o administrador

```bash
npm run db:push     # cria as tabelas a partir do schema.prisma
npm run db:seed     # cria o admin (ADMIN_EMAIL/ADMIN_PASSWORD) + "Quem Somos"
```

> O seed é **limpo**: não insere dados de exemplo. Todo o conteúdo é criado
> pelo painel.

### 6. Rodar o servidor

```bash
npm run dev
```

- Portal público: http://localhost:3000
- Painel admin: http://localhost:3000/admin

### 🔑 Credenciais de acesso
Definidas por você em `ADMIN_EMAIL` / `ADMIN_PASSWORD` no `.env`. A senha é
gravada com hash **bcrypt**.

## 📎 Armazenamento de arquivos (uploads)

Os uploads **não** ficam em `public/`. São gravados no diretório apontado por
`STORAGE_PATH` e servidos pela rota `/api/files/[...path]`:

| Ambiente | `STORAGE_PATH`      | Observação                          |
| -------- | ------------------- | ----------------------------------- |
| Local    | `./private/storage` | fora do git (`.gitignore`)          |
| Railway  | `/data`             | **Railway Volume** (disco durável)  |

- `<STORAGE_PATH>/uploads/` → arquivos públicos (imagens, editais, PDFs).
  No banco fica `/api/files/uploads/<arquivo>`.
- `<STORAGE_PATH>/filiacao/` → documentos da filiação (**LGPD**). A rota
  `/api/files` exige **sessão do painel** para esta pasta (retorna 401 sem login).

A rota protege contra *path traversal* e define o `Content-Type` pela extensão.

## 📁 Estrutura de pastas

```
prisma/
  schema.prisma           # Modelos do banco (deliverable principal)
  seed.ts                 # Dados iniciais + admin
src/
  app/
    (public)/             # Portal público (Navbar + Footer)
      page.tsx            # / (histórico, destaques, eventos, galeria, vídeo)
      quem-somos/
      saiu-na-imprensa/
      noticias/[slug]/
      transparencia/
      eventos/
      servicos/[submenu]/
      filiacao/
      eleicoes/
    admin/
      login/              # Tela de login (fora do layout protegido)
      (dashboard)/        # Área protegida (sidebar + header)
        dashboard/
        noticias/
        eventos/
        transparencia/
        filiacoes/
        coordenacoes/
        diretorias/
        eleicoes/[id]/
        servicos/
    actions/              # Server Actions (mutações seguras no banco)
    api/
      auth/[...nextauth]/ # Rota do NextAuth
      upload/             # Recebe uploads -> grava em STORAGE_PATH/uploads
      files/[...path]/    # Serve os arquivos do STORAGE_PATH (Volume)
    sitemap.ts / robots.ts
  components/
    ui/                   # Componentes shadcn/ui (button, card, dialog, ...)
    layout/               # Navbar, Footer
    admin/                # Sidebar, modais de CRUD, editores
    public/               # Cards, abas, gráficos do portal
  lib/
    prisma.ts             # Cliente Prisma (singleton)
    auth.ts               # Configuração do NextAuth
    queries.ts            # Leituras públicas (resilientes a falha de DB)
    validations.ts        # Schemas Zod
    utils.ts              # cn, slugify, formatação, CPF, YouTube
    site.ts               # Navegação e constantes
  middleware.ts           # Protege rotas /admin/*
```

## 🔐 Segurança

- Rotas `/admin/*` protegidas por **middleware** (NextAuth) + verificação de
  sessão no layout do servidor.
- Server Actions validam a sessão novamente (`requireAuth` / `requireAdmin`) —
  defesa em profundidade.
- Upload restrito a usuários autenticados, com limite de tamanho e tipos.
- Formulário de filiação em conformidade com a **LGPD** (consentimento
  obrigatório e finalidade declarada).

## 📦 Scripts úteis

| Comando             | Descrição                                          |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                        |
| `npm run build`     | Build de produção (`next build`)                   |
| `npm run start`     | Servidor de produção                               |
| `npm run db:push`   | Sincroniza o schema com o banco                    |
| `npm run db:migrate`| Cria uma migration versionada                      |
| `npm run db:seed`   | Cria o admin de produção + "Quem Somos"            |
| `npm run db:studio` | Abre o Prisma Studio                               |

> O Prisma Client é gerado no `postinstall` — por isso o `build` é apenas
> `next build` (requisito do Railway).

## 🚂 Deploy no Railway

1. **Postgres:** _New → Database → PostgreSQL_.
2. **App:** _New → GitHub Repo_ → selecione este repositório.
3. **Volume (obrigatório):** no serviço da app, _Settings → Volumes → New Volume_
   e monte em **`/data`**. Sem isso, os uploads são apagados a cada deploy
   (disco efêmero).
4. **Variables** (no serviço da app):

   | Variável               | Valor                                   |
   | ---------------------- | --------------------------------------- |
   | `DATABASE_URL`         | `${{Postgres.DATABASE_URL}}`            |
   | `NEXTAUTH_SECRET`      | `openssl rand -base64 32`               |
   | `NEXTAUTH_URL`         | URL pública do serviço                  |
   | `NEXT_PUBLIC_SITE_URL` | mesma URL pública                       |
   | `NEXT_PUBLIC_SITE_NAME`| `ADCESP - Secção Sindical...`           |
   | `STORAGE_PATH`         | `/data` (mount path do Volume)          |
   | `ADMIN_EMAIL`          | e-mail do administrador                 |
   | `ADMIN_PASSWORD`       | senha forte do administrador            |

5. **Banco + admin** (uma vez, via Railway CLI ou terminal do serviço):

   ```bash
   npm run db:push
   npm run db:seed
   ```

## 🗳️ Fluxo de Eleições (admin)

1. **Criar eleição** (status `AGUARDANDO`) com cronograma e edital.
2. **Gerenciar** → adicionar **chapas** e **vincular candidatos** (cargos com
   "Estadual" no nome são agrupados como Coordenação Estadual; os demais como
   Regionais no portal).
3. **Iniciar** a eleição (status `EM_ANDAMENTO`) — passa a aparecer em destaque
   na página pública `/eleicoes`.
4. **Apuração** → lançar votos por chapa, brancos e nulos → o sistema calcula a
   chapa vencedora e encerra o pleito (status `CONCLUIDO`), exibindo gráficos no
   portal.

## 📝 Notas

- O editor de texto rico usa **TipTap** (`src/components/admin/tiptap-editor.tsx`).
- Os uploads usam o sistema de arquivos + **Railway Volume** (ver
  "Armazenamento de arquivos"). Para migrar para S3/Cloudinary no futuro, basta
  trocar a implementação de `src/lib/uploads.ts` e da rota `/api/files`.
