import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route('create', 'routes/create.tsx'),
    route('join', 'routes/join.tsx'),
    route('p/:roomId', 'routes/play.tsx')
] satisfies RouteConfig;
