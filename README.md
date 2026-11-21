# Atividade N3 — Loja API

Projeto acadêmico de DevOps & Cloud Computing com Node.js, MySQL, Redis, Docker, Docker Compose e Kubernetes.

## Estrutura

```text
atividade-n3/
├── app/                 # API Node.js, Dockerfile e .dockerignore
├── k8s/                 # Manifestos Kubernetes
├── docker-compose.yml
├── .env.example         # Modelo de variáveis (sem senhas reais)
├── .gitignore
├── comandos.md          # Registro das operações realizadas
└── README.md
```

## Pré-requisitos

- Docker Desktop com Docker Compose.
- Docker Desktop Kubernetes habilitado para a etapa Kubernetes.
- kubectl configurado para o cluster local.

## Executar com Docker Compose

1. Copie `.env.example` para `.env`.
2. Preencha as senhas locais no `.env`.
3. Na raiz do projeto, execute:

```powershell
docker compose up -d --build
```

4. Verifique os serviços:

```powershell
docker compose ps
```

5. Teste a saúde da API e a listagem:

```powershell
Invoke-RestMethod http://localhost:3001/health
Invoke-RestMethod http://localhost:3001/produtos
```

Para cadastrar um produto:

```powershell
$body = @{ nome = "Mouse"; preco = 150 } | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:3000/produtos -Method POST -ContentType "application/json" -Body $body
```

O MySQL utiliza o volume nomeado `mysql_data`. Para testar persistência, registre um produto, execute `docker compose down` (sem `-v`), suba novamente com `docker compose up -d` e consulte `/produtos`. **Não use `docker compose down -v` durante esse teste**, pois isso remove o volume.

## Executar no Kubernetes

O namespace usado neste projeto é `n3-weslei`.

Aplique primeiro o namespace e depois os demais manifestos. Isso evita tentar criar recursos antes de o namespace existir:

```powershell
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mysql.yaml
kubectl apply -f k8s/redis.yaml
kubectl apply -f k8s/api-service.yaml
kubectl apply -f k8s/api-deployment.yaml
```

A API usa a imagem local `atividade-n3-api:latest` no manifesto atual. Antes de aplicar o Deployment, construa/carregue a imagem no ambiente Docker utilizado pelo Kubernetes:

```powershell
docker build -t atividade-n3-api:latest ./app
```

Confira os recursos e os pods:

```powershell
kubectl get all -n n3-weslei
kubectl get pvc -n n3-weslei
kubectl get pods -n n3-weslei
```

Para acessar a API por encaminhamento local, em um terminal mantenha este comando em execução:

```powershell
kubectl port-forward deployment/api 3001:3000 -n n3-weslei
```

Em outro terminal:

```powershell
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/produtos
```

## Segurança

- `.env` é local e não deve ser versionado.
- `.env.example` contém apenas nomes de variáveis e valores ilustrativos.
- O Secret Kubernetes deste repositório usa senha de laboratório; substitua por credenciais fictícias/locais antes de publicar e nunca inclua senhas pessoais ou de produção.

## Evidências e relatório

As operações exigidas e os espaços para registrar evidências estão organizados em `comandos.md`. O relatório PDF deverá reunir as seis evidências obrigatórias e as oito respostas solicitadas no enunciado.
