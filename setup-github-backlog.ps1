# =============================================================
# Script: setup-github-backlog.ps1
# Descripcion: Crea el backlog completo en GitHub para el proyecto
#              Plataforma de Servicios Artisticos - G50
#
# REQUISITO PREVIO:
#   gh auth login   (ejecuta esto primero en tu terminal)
#
# USO:
#   .\setup-github-backlog.ps1
# =============================================================

$REPO = "yarield/prototipoAdmin3"

Write-Host "`n==== CONFIGURANDO BACKLOG EN GITHUB ====" -ForegroundColor Cyan
Write-Host "Repositorio: $REPO`n"

# =============================================================
# 1. LABELS
# =============================================================
Write-Host "--- Creando labels..." -ForegroundColor Yellow

$labels = @(
    @{ name = "type: feature";      color = "0075ca"; description = "Historia de usuario o funcionalidad" },
    @{ name = "type: task";         color = "e4e669"; description = "Tarea tecnica especifica" },
    @{ name = "type: bug";          color = "d73a4a"; description = "Defecto detectado" },
    @{ name = "priority: high";     color = "b60205"; description = "Alta prioridad" },
    @{ name = "priority: medium";   color = "fbca04"; description = "Prioridad media" },
    @{ name = "priority: low";      color = "0e8a16"; description = "Baja prioridad" },
    @{ name = "component: frontend";color = "1d76db"; description = "[FE] Interfaz de usuario - Next.js/TypeScript" },
    @{ name = "component: backend"; color = "0e8a16"; description = "[BE] API REST - Node.js/Express" },
    @{ name = "component: database";color = "e4871e"; description = "[DB] Base de datos - PostgreSQL" },
    @{ name = "component: ci-cd";   color = "b5860d"; description = "[CI] Pipelines, GitHub Actions, despliegue" },
    @{ name = "component: ux";      color = "7057ff"; description = "[UX] Mockups, prototipado, diseno" },
    @{ name = "component: research";color = "666666"; description = "[INV] Investigacion, documentacion" },
    @{ name = "sprint: 1";          color = "c5def5"; description = "Sprint 1 - Investigacion y configuracion" },
    @{ name = "sprint: 2";          color = "bfd4f2"; description = "Sprint 2 - Registro y autenticacion" },
    @{ name = "sprint: 3";          color = "d4c5f9"; description = "Sprint 3 - Perfil y catalogo" },
    @{ name = "sprint: 4";          color = "c2e0c6"; description = "Sprint 4 - Busqueda y agenda" },
    @{ name = "sprint: 5";          color = "f9d0c4"; description = "Sprint 5 - Contratos y cierre MVP" }
)

foreach ($label in $labels) {
    Write-Host "  Creando label: $($label.name)"
    gh label create $label.name --color $label.color --description $label.description --repo $REPO 2>$null
}

# =============================================================
# 2. MILESTONES (uno por sprint)
# =============================================================
Write-Host "`n--- Creando milestones (sprints)..." -ForegroundColor Yellow

gh api repos/$REPO/milestones -X POST -f title="Sprint 1 - Investigacion y configuracion del entorno" -f description="Objetivo: Infraestructura CI/CD lista, stack definido, mockups aprobados. Total: 18 SP" -f due_on="2026-06-15T23:59:59Z" --silent
Write-Host "  Milestone Sprint 1 creado"

gh api repos/$REPO/milestones -X POST -f title="Sprint 2 - Registro y autenticacion de usuarios" -f description="Objetivo: Artistas y clientes pueden crear cuentas y acceder al sistema. Total: 14 SP" -f due_on="2026-06-22T23:59:59Z" --silent
Write-Host "  Milestone Sprint 2 creado"

gh api repos/$REPO/milestones -X POST -f title="Sprint 3 - Perfil del artista y catalogo de servicios" -f description="Objetivo: Artistas pueden publicar su talento y portafolio. CD a staging. Total: 20 SP" -f due_on="2026-06-29T23:59:59Z" --silent
Write-Host "  Milestone Sprint 3 creado"

gh api repos/$REPO/milestones -X POST -f title="Sprint 4 - Busqueda y gestion de agenda" -f description="Objetivo: Clientes encuentran artistas y solicitan contratacion. Total: 18 SP" -f due_on="2026-07-06T23:59:59Z" --silent
Write-Host "  Milestone Sprint 4 creado"

gh api repos/$REPO/milestones -X POST -f title="Sprint 5 - Contratos, notificaciones y cierre MVP" -f description="Objetivo: Flujo completo de contratacion funcional para la demo. CD a produccion. Total: 17 SP" -f due_on="2026-07-13T23:59:59Z" --silent
Write-Host "  Milestone Sprint 5 creado"

# =============================================================
# 3. ISSUES - SPRINT 1
# =============================================================
Write-Host "`n--- Creando issues Sprint 1..." -ForegroundColor Yellow

gh issue create --repo $REPO `
  --title "[US-01] Investigar e integrar Jira/GitHub con CI/CD" `
  --body "**Como** equipo de desarrollo, **quiero** investigar y documentar como integrar GitHub con CI/CD para establecer el flujo de trabajo del proyecto.

## Criterios de aceptacion
- [ ] Documento con comparativa de herramientas CI/CD (GitHub Actions vs Jenkins).
- [ ] Decision documentada y justificada del stack seleccionado.
- [ ] Informe aprobado por el profesor en la reunion de Sprint Review.

**Story Points:** 5 SP
**Tags:** [INV] [CI]" `
  --label "type: feature,component: ci-cd,component: research,priority: high,sprint: 1" `
  --milestone "Sprint 1 - Investigacion y configuracion del entorno"
Write-Host "  Issue US-01 creado"

gh issue create --repo $REPO `
  --title "[US-02] Configurar repositorio GitHub con ramas y Jira" `
  --body "**Como** equipo de desarrollo, **quiero** configurar el repositorio en GitHub con ramas main/develop/feature y conectarlo para gestionar el backlog desde una sola herramienta.

## Criterios de aceptacion
- [ ] Repositorio creado con estructura de ramas (main, develop, feature/*).
- [ ] Issues vinculados con commits.
- [ ] Cada historia de usuario referenciada desde su tarjeta en el project board.

**Story Points:** 3 SP
**Tags:** [CI] [INV]" `
  --label "type: task,component: ci-cd,component: research,priority: high,sprint: 1" `
  --milestone "Sprint 1 - Investigacion y configuracion del entorno"
Write-Host "  Issue US-02 creado"

gh issue create --repo $REPO `
  --title "[US-03] Configurar pipeline CI basico (lint + build)" `
  --body "**Como** equipo de desarrollo, **quiero** configurar un pipeline basico de CI en GitHub Actions para detectar errores automaticamente en cada push.

## Criterios de aceptacion
- [ ] Pipeline ejecuta lint y build en cada push a cualquier rama.
- [ ] Estado del pipeline visible en el PR de GitHub.
- [ ] El merge a develop solo se permite si el pipeline pasa exitosamente.

**Story Points:** 5 SP
**Tags:** [CI]" `
  --label "type: task,component: ci-cd,priority: high,sprint: 1" `
  --milestone "Sprint 1 - Investigacion y configuracion del entorno"
Write-Host "  Issue US-03 creado"

gh issue create --repo $REPO `
  --title "[US-04] Definir stack tecnologico y documentar en Project Charter" `
  --body "**Como** equipo de desarrollo, **quiero** definir el stack tecnologico (frontend, backend, base de datos) y documentarlo en el Project Charter.

## Criterios de aceptacion
- [ ] Stack documentado con justificacion de cada tecnologia.
- [ ] Project Charter aprobado por el grupo y compartido en el repo.
- [ ] Se incluye diagrama de arquitectura de alto nivel.

**Stack definido:**
- Frontend: Next.js 15 + TypeScript
- Backend: Node.js + Express
- Base de datos: PostgreSQL (Supabase)
- CI/CD: GitHub Actions
- Despliegue: Vercel

**Story Points:** 2 SP
**Tags:** [INV]" `
  --label "type: task,component: research,priority: high,sprint: 1" `
  --milestone "Sprint 1 - Investigacion y configuracion del entorno"
Write-Host "  Issue US-04 creado"

gh issue create --repo $REPO `
  --title "[US-05] Crear mockups de bajo nivel de las pantallas principales" `
  --body "**Como** equipo de desarrollo, **quiero** crear los mockups de bajo nivel de las pantallas principales para validar la propuesta antes de codificar.

## Criterios de aceptacion
- [ ] Mockups de al menos 4 pantallas: registro, perfil artista, busqueda y solicitud.
- [ ] Revisados y aprobados por ambos integrantes del grupo.
- [ ] Adjuntos como evidencia en el repo antes del fin del sprint.

**Story Points:** 3 SP
**Tags:** [UX]" `
  --label "type: task,component: ux,priority: medium,sprint: 1" `
  --milestone "Sprint 1 - Investigacion y configuracion del entorno"
Write-Host "  Issue US-05 creado"

# =============================================================
# 4. ISSUES - SPRINT 2
# =============================================================
Write-Host "`n--- Creando issues Sprint 2..." -ForegroundColor Yellow

gh issue create --repo $REPO `
  --title "[US-06] Registro de artista en la plataforma" `
  --body "**Como** artista, **quiero** registrarme en la plataforma con mi nombre, correo, contrasena y tipo de arte para poder crear mi perfil.

## Criterios de aceptacion
- [ ] Formulario valida correo unico y contrasena con minimo 8 caracteres.
- [ ] Se selecciona al menos una categoria artistica en el registro.
- [ ] El sistema envia correo de confirmacion tras el registro exitoso.
- [ ] El artista queda en estado 'pendiente de completar perfil' hasta agregar mas informacion.

**Story Points:** 5 SP
**Tags:** [FE] [BE] [DB]" `
  --label "type: feature,component: frontend,component: backend,component: database,priority: high,sprint: 2" `
  --milestone "Sprint 2 - Registro y autenticacion de usuarios"
Write-Host "  Issue US-06 creado"

gh issue create --repo $REPO `
  --title "[US-07] Registro de cliente en la plataforma" `
  --body "**Como** cliente, **quiero** registrarme con mi nombre, correo y contrasena para poder buscar artistas y gestionar contrataciones.

## Criterios de aceptacion
- [ ] Formulario diferencia el tipo de cuenta: artista vs. cliente.
- [ ] Validacion de correo unico en la base de datos.
- [ ] El cliente puede iniciar sesion inmediatamente despues del registro.

**Story Points:** 3 SP
**Tags:** [FE] [BE] [DB]" `
  --label "type: feature,component: frontend,component: backend,component: database,priority: high,sprint: 2" `
  --milestone "Sprint 2 - Registro y autenticacion de usuarios"
Write-Host "  Issue US-07 creado"

gh issue create --repo $REPO `
  --title "[US-08] Login y logout seguro con JWT" `
  --body "**Como** usuario (artista o cliente), **quiero** iniciar y cerrar sesion de forma segura para proteger mi informacion en la plataforma.

## Criterios de aceptacion
- [ ] Autenticacion mediante JWT con expiracion de 24 horas.
- [ ] La sesion se destruye completamente al cerrar sesion.
- [ ] El sistema redirige al login si el token expira o es invalido.
- [ ] Intentos fallidos consecutivos bloquean temporalmente el acceso.

**Story Points:** 3 SP
**Tags:** [FE] [BE]" `
  --label "type: feature,component: frontend,component: backend,priority: high,sprint: 2" `
  --milestone "Sprint 2 - Registro y autenticacion de usuarios"
Write-Host "  Issue US-08 creado"

gh issue create --repo $REPO `
  --title "[US-09] Pruebas unitarias del modulo de autenticacion en CI" `
  --body "**Como** equipo de desarrollo, **quiero** agregar pruebas unitarias del modulo de autenticacion al pipeline de CI para garantizar cobertura minima del 70%.

## Criterios de aceptacion
- [ ] Pruebas cubren: registro, login, logout y token invalido.
- [ ] Reporte de cobertura generado automaticamente en cada ejecucion del pipeline.
- [ ] El pipeline falla si la cobertura baja del 70%.
- [ ] Resultados visibles en el dashboard de GitHub Actions.

**Story Points:** 3 SP
**Tags:** [CI] [BE]" `
  --label "type: task,component: ci-cd,component: backend,priority: high,sprint: 2" `
  --milestone "Sprint 2 - Registro y autenticacion de usuarios"
Write-Host "  Issue US-09 creado"

# =============================================================
# 5. ISSUES - SPRINT 3
# =============================================================
Write-Host "`n--- Creando issues Sprint 3..." -ForegroundColor Yellow

gh issue create --repo $REPO `
  --title "[US-10] Crear y editar perfil publico del artista" `
  --body "**Como** artista, **quiero** crear y editar mi perfil con foto, biografia, categoria artistica y localizacion para presentarme profesionalmente a los clientes.

## Criterios de aceptacion
- [ ] Perfil incluye: nombre artistico, foto, bio (max. 500 caracteres), categoria y provincia.
- [ ] El artista puede actualizar la informacion sin restricciones de frecuencia.
- [ ] La foto se redimensiona automaticamente a 400x400 px.
- [ ] El perfil muestra fecha de 'ultima actualizacion'.

**Story Points:** 5 SP
**Tags:** [FE] [BE] [DB]" `
  --label "type: feature,component: frontend,component: backend,component: database,priority: high,sprint: 3" `
  --milestone "Sprint 3 - Perfil del artista y catalogo de servicios"
Write-Host "  Issue US-10 creado"

gh issue create --repo $REPO `
  --title "[US-11] Publicar servicios del artista con precios y condiciones" `
  --body "**Como** artista, **quiero** publicar los servicios que ofrezco (nombre, descripcion, precio base, duracion y condiciones tecnicas) para que los clientes sepan que contratar.

## Criterios de aceptacion
- [ ] Formulario incluye: nombre del servicio, descripcion, precio base, duracion estimada y condiciones.
- [ ] El artista puede tener hasta 10 servicios activos simultaneamente.
- [ ] Cada servicio tiene estado: activo / inactivo.
- [ ] Los servicios aparecen visibles en el perfil publico del artista.

**Story Points:** 5 SP
**Tags:** [FE] [BE] [DB]" `
  --label "type: feature,component: frontend,component: backend,component: database,priority: high,sprint: 3" `
  --milestone "Sprint 3 - Perfil del artista y catalogo de servicios"
Write-Host "  Issue US-11 creado"

gh issue create --repo $REPO `
  --title "[US-12] Subir fotos y videos de muestra al portafolio" `
  --body "**Como** artista, **quiero** subir fotos o videos cortos de muestra a mi perfil para que los clientes puedan ver mi trabajo antes de contratarme.

## Criterios de aceptacion
- [ ] Se permiten hasta 6 fotos (JPG/PNG, max. 5 MB cada una).
- [ ] Se permite hasta 1 video (MP4, max. 50 MB).
- [ ] El artista puede eliminar o reemplazar cualquier archivo del portafolio.
- [ ] La galeria es visible para clientes sin necesidad de iniciar sesion.

**Story Points:** 5 SP
**Tags:** [FE] [BE]" `
  --label "type: feature,component: frontend,component: backend,priority: medium,sprint: 3" `
  --milestone "Sprint 3 - Perfil del artista y catalogo de servicios"
Write-Host "  Issue US-12 creado"

gh issue create --repo $REPO `
  --title "[US-13] Configurar despliegue automatico CD a staging (Vercel)" `
  --body "**Como** equipo de desarrollo, **quiero** configurar despliegue automatico (CD) al ambiente de staging cada vez que haya un merge a develop.

## Criterios de aceptacion
- [ ] El pipeline despliega automaticamente a staging tras merge a develop exitoso.
- [ ] La URL de staging es accesible para pruebas manuales.
- [ ] El pipeline notifica al equipo si el despliegue falla.
- [ ] El ambiente de staging usa variables de entorno separadas de produccion.

**Herramienta:** Vercel (preview deployment automatico)

**Story Points:** 5 SP
**Tags:** [CI]" `
  --label "type: task,component: ci-cd,priority: high,sprint: 3" `
  --milestone "Sprint 3 - Perfil del artista y catalogo de servicios"
Write-Host "  Issue US-13 creado"

# =============================================================
# 6. ISSUES - SPRINT 4
# =============================================================
Write-Host "`n--- Creando issues Sprint 4..." -ForegroundColor Yellow

gh issue create --repo $REPO `
  --title "[US-14] Buscar artistas por categoria, nombre o provincia" `
  --body "**Como** cliente, **quiero** buscar artistas por categoria artistica, nombre o provincia para encontrar el talento adecuado para mi evento.

## Criterios de aceptacion
- [ ] La busqueda filtra por: categoria, nombre (parcial) y provincia.
- [ ] Los resultados se muestran como tarjetas con foto, nombre y categoria.
- [ ] La busqueda devuelve resultados en menos de 2 segundos.
- [ ] Se muestra un mensaje claro si no hay resultados para la busqueda.

**Story Points:** 5 SP
**Tags:** [FE] [BE]" `
  --label "type: feature,component: frontend,component: backend,priority: high,sprint: 4" `
  --milestone "Sprint 4 - Busqueda y gestion de agenda"
Write-Host "  Issue US-14 creado"

gh issue create --repo $REPO `
  --title "[US-15] Ver perfil publico completo de un artista" `
  --body "**Como** cliente, **quiero** ver el perfil publico completo de un artista (servicios, portafolio, disponibilidad) para decidir si quiero contratarlo.

## Criterios de aceptacion
- [ ] El perfil muestra: bio, categoria, servicios activos, galeria y disponibilidad general.
- [ ] El cliente puede ver el perfil sin necesidad de iniciar sesion.
- [ ] Hay un boton de 'Solicitar contratacion' visible y accesible.
- [ ] Los servicios del artista muestran precio y duracion estimada.

**Story Points:** 3 SP
**Tags:** [FE]" `
  --label "type: feature,component: frontend,priority: medium,sprint: 4" `
  --milestone "Sprint 4 - Busqueda y gestion de agenda"
Write-Host "  Issue US-15 creado"

gh issue create --repo $REPO `
  --title "[US-16] Gestionar agenda del artista con disponibilidad" `
  --body "**Como** artista, **quiero** gestionar mi agenda marcando fechas disponibles y bloqueadas para que los clientes solo puedan solicitar en fechas posibles.

## Criterios de aceptacion
- [ ] El artista puede marcar dias como disponible, no disponible o reservado.
- [ ] La agenda muestra una vista de calendario mensual.
- [ ] Las fechas bloqueadas no permiten recibir nuevas solicitudes.
- [ ] Los cambios de disponibilidad se reflejan en tiempo real en el perfil publico.

**Story Points:** 5 SP
**Tags:** [FE] [BE] [DB]" `
  --label "type: feature,component: frontend,component: backend,component: database,priority: high,sprint: 4" `
  --milestone "Sprint 4 - Busqueda y gestion de agenda"
Write-Host "  Issue US-16 creado"

gh issue create --repo $REPO `
  --title "[US-17] Enviar solicitud de contratacion a un artista" `
  --body "**Como** cliente, **quiero** enviar una solicitud de contratacion a un artista (fecha, tipo de evento y descripcion) para iniciar la gestion del contrato.

## Criterios de aceptacion
- [ ] La solicitud incluye: fecha del evento, tipo de evento, descripcion y lugar.
- [ ] Solo se pueden solicitar fechas marcadas como disponibles por el artista.
- [ ] El artista recibe una notificacion al recibir una nueva solicitud.
- [ ] La solicitud queda en estado 'pendiente' hasta que el artista responda.
- [ ] El cliente puede cancelar la solicitud mientras este en estado pendiente.

**Story Points:** 5 SP
**Tags:** [FE] [BE] [DB]" `
  --label "type: feature,component: frontend,component: backend,component: database,priority: high,sprint: 4" `
  --milestone "Sprint 4 - Busqueda y gestion de agenda"
Write-Host "  Issue US-17 creado"

# =============================================================
# 7. ISSUES - SPRINT 5
# =============================================================
Write-Host "`n--- Creando issues Sprint 5..." -ForegroundColor Yellow

gh issue create --repo $REPO `
  --title "[US-18] Aceptar o rechazar solicitudes de contratacion" `
  --body "**Como** artista, **quiero** aceptar o rechazar solicitudes de contratacion recibidas para gestionar mi agenda de trabajo.

## Criterios de aceptacion
- [ ] El artista ve una lista de solicitudes pendientes en su panel.
- [ ] Al aceptar, la fecha se marca automaticamente como reservada en la agenda.
- [ ] Al rechazar, se puede ingresar un motivo opcional.
- [ ] El cliente recibe notificacion del resultado inmediatamente.

**Story Points:** 3 SP
**Tags:** [FE] [BE]" `
  --label "type: feature,component: frontend,component: backend,priority: high,sprint: 5" `
  --milestone "Sprint 5 - Contratos, notificaciones y cierre MVP"
Write-Host "  Issue US-18 creado"

gh issue create --repo $REPO `
  --title "[US-19] Sistema de notificaciones en la plataforma" `
  --body "**Como** usuario (artista o cliente), **quiero** recibir notificaciones en la plataforma sobre cambios en el estado de mis solicitudes para mantenerme informado.

## Criterios de aceptacion
- [ ] Las notificaciones aparecen en una campanita en el encabezado de la app.
- [ ] Se generan notificaciones para: solicitud recibida, aceptada, rechazada y cancelada.
- [ ] El usuario puede marcar notificaciones como leidas individualmente o todas a la vez.
- [ ] Las notificaciones no leidas muestran un contador numerico.

**Story Points:** 3 SP
**Tags:** [FE] [BE]" `
  --label "type: feature,component: frontend,component: backend,priority: medium,sprint: 5" `
  --milestone "Sprint 5 - Contratos, notificaciones y cierre MVP"
Write-Host "  Issue US-19 creado"

gh issue create --repo $REPO `
  --title "[US-20] Historial de contratos y solicitudes" `
  --body "**Como** artista o cliente, **quiero** ver el historial de mis contratos y solicitudes para tener trazabilidad de mis actividades en la plataforma.

## Criterios de aceptacion
- [ ] El historial muestra todas las solicitudes con su estado final.
- [ ] Se puede filtrar por estado: pendiente, aceptada, rechazada, cancelada.
- [ ] Cada solicitud muestra: artista/cliente, fecha del evento, fecha de solicitud y estado.
- [ ] El historial esta disponible en el panel personal de cada usuario.

**Story Points:** 3 SP
**Tags:** [FE] [BE] [DB]" `
  --label "type: feature,component: frontend,component: backend,component: database,priority: medium,sprint: 5" `
  --milestone "Sprint 5 - Contratos, notificaciones y cierre MVP"
Write-Host "  Issue US-20 creado"

gh issue create --repo $REPO `
  --title "[US-21] CD completo a produccion con aprobacion manual" `
  --body "**Como** equipo de desarrollo, **quiero** configurar despliegue automatico a produccion (CD completo) con aprobacion manual en el pipeline para completar el flujo DevOps del proyecto.

## Criterios de aceptacion
- [ ] El pipeline en produccion requiere aprobacion explicita de un integrante del equipo.
- [ ] Se ejecutan pruebas de integracion automaticas antes de solicitar la aprobacion.
- [ ] El despliegue a produccion solo ocurre desde la rama main.
- [ ] Se genera un tag de version en GitHub con cada despliegue exitoso a produccion.

**Story Points:** 5 SP
**Tags:** [CI]" `
  --label "type: task,component: ci-cd,priority: high,sprint: 5" `
  --milestone "Sprint 5 - Contratos, notificaciones y cierre MVP"
Write-Host "  Issue US-21 creado"

gh issue create --repo $REPO `
  --title "[US-22] Preparar demo del MVP y video de CI/CD" `
  --body "**Como** equipo de desarrollo, **quiero** preparar la demo del MVP y el video de CI/CD documentando el flujo implementado durante los 5 sprints para el entregable final.

## Criterios de aceptacion
- [ ] El video muestra el flujo completo de CI/CD desde un commit hasta produccion.
- [ ] La demo cubre el flujo principal: registro, perfil, busqueda, solicitud y respuesta.
- [ ] Todos los entregables estan centralizados en el repositorio GitHub.
- [ ] La cuenta proyectoscomputaciontecap@gmail.com tiene acceso al proyecto.

**Story Points:** 3 SP
**Tags:** [CI] [INV]" `
  --label "type: task,component: ci-cd,component: research,priority: high,sprint: 5" `
  --milestone "Sprint 5 - Contratos, notificaciones y cierre MVP"
Write-Host "  Issue US-22 creado"

# =============================================================
# RESUMEN
# =============================================================
Write-Host "`n==== BACKLOG CREADO EXITOSAMENTE ====" -ForegroundColor Green
Write-Host ""
Write-Host "Resumen:"
Write-Host "  - 17 labels creados"
Write-Host "  -  5 milestones (sprints)"
Write-Host "  - 22 issues (US-01 a US-22)"
Write-Host "  - 87 story points en total"
Write-Host ""
Write-Host "Proximos pasos manuales en GitHub:"
Write-Host "  1. Ir a tu repo -> Projects -> New project -> Board (Kanban)"
Write-Host "  2. Crear columnas: Backlog / To Do / In Progress / In Review / Done"
Write-Host "  3. Agregar todos los issues al Project Board"
Write-Host "  4. Invitar a proyectoscomputaciontecap@gmail.com como colaborador"
Write-Host "     (Settings -> Collaborators -> Add people)"
Write-Host ""
Write-Host "Ver issues: https://github.com/$REPO/issues" -ForegroundColor Cyan
Write-Host "Ver milestones: https://github.com/$REPO/milestones" -ForegroundColor Cyan
