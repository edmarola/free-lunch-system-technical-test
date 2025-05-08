# Jornada de Almuerzo Gratis - Eduardo

Prueba técnica de Alegra para backend developer en NodeJS.

# Pasos para el deployment en instancia de EC2:

- Crear archivo `~/.aws/config` con el siguiente contenido:

```
[default]
region = <colocar aqui la región de aws>
```

- Crear archivo `~/.aws/credentials` con el siguiente contenido:

```
[default]
aws_access_key_id = <colocar aquí su access key ID>
aws_secret_access_key = <colocar aquí su secret access key>
```

- Crear archivo de variables de entorno para cada carpeta de microservicio según indica el `.env.example`.
- Correr todos los contenedores: `docker compose up --build -d`
