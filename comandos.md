Registro de comandos --- Atividade N3
Namespace: n3-weslei

Este documento registra os comandos e os resultados observados durante a
atividade. As capturas de tela devem ser identificadas e anexadas ao
relatório PDF. Não foram incluídas saídas fictícias.
1. Escalonamento manual --- 2 para 4 e retorno para 2
Comandos executados:
kubectl scale deployment api --replicas=4 -n n3-weslei
kubectl get deployments -n n3-weslei

kubectl scale deployment api --replicas=2 -n n3-weslei
kubectl get deployments -n n3-weslei
Resultado observado: a API foi escalada de 2 para 4 réplicas e
depois retornou para 2 réplicas.

Evidência: anexar a captura que mostre as duas alterações.
2. Atualização da API para versão 2.0
Construção da imagem:
docker build -t atividade-n3-api:2.0 ./app
Atualização do Deployment:
kubectl set image deployment/api api=atividade-n3-api:2.0 -n n3-weslei
Acompanhamento da atualização:
kubectl rollout status deployment/api -n n3-weslei
Consulta do histórico:
kubectl rollout history deployment/api -n n3-weslei
Resultado observado: a imagem atividade-n3-api:2.0 foi aplicada e
o rollout foi concluído com sucesso. O histórico de revisões foi
consultado.

Evidência: anexar as capturas do build, da atualização e do
histórico do rollout.
3. Falha proposital e recuperação com rollout undo
Foi aplicada propositalmente uma imagem inexistente:
kubectl set image deployment/api api=atividade-n3-api:99.0 -n n3-weslei
Acompanhamento da atualização:
kubectl rollout status deployment/api -n n3-weslei --timeout=60s
Consulta dos Pods:
kubectl get pods -n n3-weslei
Diagnóstico do Pod que apresentou a falha:
kubectl describe pod api-dc9b5659f-rggfb -n n3-weslei
Recuperação:
kubectl rollout undo deployment/api -n n3-weslei
kubectl rollout status deployment/api -n n3-weslei
Resultado observado: a imagem inexistente atividade-n3-api:99.0
provocou os erros ErrImagePull e ImagePullBackOff. Os eventos do Pod
indicaram que o repositório da imagem não existia ou não estava
acessível. O comando rollout undo restaurou a versão anterior, 2.0,
e a API voltou a responder.

Evidência: anexar as capturas da aplicação da imagem inexistente, do
diagnóstico do Pod e da recuperação.
4. Requests e limits com kubectl set resources
Comando executado:
kubectl set resources deployment/api -n n3-weslei --requests=cpu=100m,memory=128Mi --limits=cpu=500m,memory=512Mi
Conferência:
kubectl describe deployment api -n n3-weslei
Valores configurados:
- CPU request: 100m
- Memória request: 128Mi
- CPU limit: 500m
- Memória limit: 512Mi
Resultado observado: os valores foram aplicados ao Deployment e
conferidos com describe deployment.

Evidência: anexar a captura que mostre os requests e limits
configurados.
5. Autoscaling (HPA)
Criação do HPA:
kubectl autoscale deployment api -n n3-weslei --cpu-percent=50 --min=2 --max=5
Consulta da configuração:
kubectl describe hpa api -n n3-weslei
Monitoramento do HPA --- executar em um terminal:
kubectl get hpa -n n3-weslei -w
Monitoramento dos Deployments --- executar em outro terminal:
kubectl get deployments -n n3-weslei -w
Geração de carga dentro do cluster:
kubectl run load-generator -n n3-weslei --image=busybox:1.36 --restart=Never -- /bin/sh -c 'while true; do wget -q -O- http://api:3000/produtos >/dev/null; done'
Interrupção da geração de carga:
kubectl delete pod load-generator -n n3-weslei
Configuração do HPA:
- Mínimo: 2 réplicas.
- Máximo: 5 réplicas.
- Meta de utilização de CPU: 50%.
Resultado observado: durante o teste de carga, a utilização de CPU
ultrapassou a meta e o Deployment aumentou de 2 para 5 réplicas. Após a
remoção do gerador de carga e a redução da utilização de CPU, o número
de réplicas retornou gradualmente para 2.

Evidência: anexar capturas do HPA antes, durante e depois da carga,
mostrando também a quantidade de réplicas.
6. Inspeção do nó
Comando executado:
kubectl describe node desktop-control-plane
Interpretação dos resultados observados:
- Capacity: representa a capacidade total informada pelo nó. No
  ambiente utilizado, foram apresentados 16 CPUs, aproximadamente 3,7
  GiB de memória e capacidade para 110 Pods.
- Allocatable: representa os recursos disponibilizados para uso
  pelos Pods. Nesse nó, os valores apresentados foram iguais aos de
  Capacity.
- Allocated resources: mostra os recursos solicitados (requests)
  e os limites (limits) configurados pelos Pods. Foram apresentados
  requests de CPU de 1900m (11%) e limits de 3650m (22%). Para
  memória, requests de 1898Mi (49%) e limits de 3686Mi (96%).
Os percentuais de Allocated resources representam recursos solicitados
ou limites configurados, não o consumo real naquele instante.

Evidência: anexar a captura do comando kubectl describe node.
Evidências obrigatórias para o PDF
Marcar cada item somente depois de inserir e conferir a respectiva
captura no relatório.
- [ ] kubectl get all -n n3-weslei
- [ ] kubectl describe deployment api -n n3-weslei
- [ ] kubectl rollout history deployment/api -n n3-weslei
- [ ] kubectl get hpa -n n3-weslei -w --- antes, durante e depois da
  carga
- [ ] kubectl top pods -n n3-weslei
- [ ] kubectl describe node desktop-control-plane
Observação final
Este documento registra os procedimentos e resultados observados durante
a atividade. As capturas de tela devem ser anexadas ao relatório PDF e
precisam corresponder aos comandos realmente executados.