# nC Language: publicación directa y actualizaciones en Visual Studio Marketplace

El identificador del paquete es `nc-lang.nc-language`; el icono oficial se conserva en `assets/nc-logo-128.png`. El VSIX `1.0.0-22v` está validado y el repositorio público `https-ncc-lenguage-org/nc` lo ha empaquetado correctamente.

## Autorizar publicación con identidad federada

En https://marketplace.visualstudio.com/manage/publishers/

1. Abre el publicador **nc-lang**.
2. En **Trusted Publishing**, crea una política para:
   - Organization/repository owner: `https-ncc-lenguage-org`
   - Repository: `nc`
   - Workflow: `nc-vscode-oidc-publish.yml`
   - Environment: vacío
3. Guarda la política. No compartas credenciales ni generes un PAT permanente.
4. Desde GitHub: Actions → `nC Language - Trusted VS Code Marketplace publishing` → Run workflow → `publish=true`, rama `main`.
5. Revisa la ejecución y la ficha del plugin en Marketplace. No declares publicada la versión basándote únicamente en el resultado de `build`.

La publicación conserva el `publisher` y `name` existentes, por lo que una instalación previa de Marketplace puede recibir la actualización normalmente. Si aún no existe un publicador autorizado para `nc-lang`, primero será necesario asociar una cuenta administradora y registrar la ficha.

La política federada requiere una intervención inicial del propietario. La workflow no ejecuta publicaciones automáticamente mientras falte esa política.

Referencia: https://code.visualstudio.com/api/working-with-extensions/publishing-extension
