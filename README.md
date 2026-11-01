# El Mafer · Pollo Asado 🍗🔥

Página de una sola pantalla para pedir pollo **a domicilio** o **para recoger**.
El pedido se envía por WhatsApp al negocio: no necesita servidor ni base de datos.

## Cómo correrla

```bash
python -m http.server 5173
```

Abre http://localhost:5173

## Qué editar

Todo vive en [`config.js`](config.js):

| Campo | Para qué |
|---|---|
| `whatsapp` | Número que recibe los pedidos (`52` + `1` + 10 dígitos) |
| `envio`, `pedidoMinimoDomicilio` | Costo de envío y mínimo para domicilio |
| `horario` | Hora de apertura/cierre (muestra "Abierto/Cerrado" y las horas para recoger) |
| `sucursales` | Dirección, teléfono y texto que se busca en Google Maps |
| `productos` | Menú: tamaños con precio y salsas opcionales |

## Paleta

| Token | Color | Uso |
|---|---|---|
| `--brasa` | `#3A1E12` | Barra superior, títulos |
| `--crema` | `#FBF3E6` | Fondo |
| `--cacahuate` | `#E3B271` | Íconos de producto |
| `--dorado` | `#F2B33D` | Bordes y detalles |
| `--chile` | `#B8321F` | Botones de acción, precios |
| `--fuego` | `#E8761C` | Botón “+”, acentos |

## Publicar gratis

Sube el repo a GitHub y activa **GitHub Pages**, o arrastra la carpeta a **Netlify** / **Vercel**.
