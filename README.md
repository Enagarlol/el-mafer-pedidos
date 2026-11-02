# El Mafer · Pollo Asado 🍗🔥

Página de una sola pantalla para pedir pollo **a domicilio** o **para recoger**.
El pedido se envía por WhatsApp al negocio: no necesita servidor ni base de datos.

**En línea:** https://el-mafer-pedidos.pages.dev

## Cómo correrla

```bash
python -m http.server 5173
```

Abre http://localhost:5173

## Qué editar

Todo vive en [`config.js`](config.js):

| Campo | Para qué |
|---|---|
| `whatsapp` | Número que recibe los pedidos (`52` + 10 dígitos) |
| `envioDesde` | Costo mínimo de envío (el real se confirma por WhatsApp según la ubicación) |
| `horario` | Hora de apertura/cierre y días que abre (muestra "Abierto/Cerrado" y las horas para recoger) |
| `sucursales` | Dirección, teléfono y texto que se busca en Google Maps |
| `productos` | Menú: precio, qué incluye y salsas opcionales |

## Paleta

| Token | Color | Uso |
|---|---|---|
| `--brasa` | `#3A1E12` | Barra superior, títulos |
| `--crema` | `#FBF3E6` | Fondo |
| `--cacahuate` | `#E3B271` | Íconos de producto |
| `--dorado` | `#F2B33D` | Bordes y detalles |
| `--chile` | `#B8321F` | Botones de acción, precios |
| `--fuego` | `#E8761C` | Botón “+”, acentos |

## Publicación

Está en **Cloudflare Pages**, conectado a este repositorio: cada push a `main` se publica solo en uno o dos minutos.
No tiene comando de compilación; el directorio de salida es `/`.

Los textos para los mensajes automáticos de WhatsApp Business están en [`whatsapp-mensajes.md`](whatsapp-mensajes.md).
