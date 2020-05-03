import * as geotic from 'geotic';
import * as PIXI from 'pixi.js';
import Stats from 'stats.js';
import { Position } from './components/Position';
import { Radius } from './components/Radius';
import { Velocity } from './components/Velocity';
import { Collider } from './components/Collider';
import { Color } from './components/Color';

const engine = new geotic.Engine();
const app = new PIXI.Application();
const stats = new Stats();
const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

engine.registerComponent(Position);
engine.registerComponent(Radius);
engine.registerComponent(Velocity);
engine.registerComponent(Collider);
engine.registerComponent(Color);

document.body.appendChild(app.view);
document.body.appendChild(stats.dom);

for (let i = 0; i < 128; i++) {
    const entity = engine.createEntity();

    entity.add(Position, {
        x: Math.random() * 800,
        y: Math.random() * 600,
    });

    entity.add(Velocity, {
        x: (Math.random() - 0.5) * 3,
        y: (Math.random() - 0.5) * 3,
    });

    entity.add(Radius, {
        value: 6 + Math.random() * 12,
    });

    entity.add(Color, {
        value: Math.floor(Math.random() * 16777215).toString(16),
    });

    entity.add(Collider);
}

const colliders = engine.createQuery({
    all: [Collider, Position, Radius, Velocity],
});

const kinematics = engine.createQuery({
    all: [Velocity, Position],
});

const circles = engine.createQuery({
    all: [Radius, Position, Color],
});

const isXOutOfbounds = (x) => x < 0 || x > 800;
const isYOutOfbounds = (y) => y < 0 || y > 600;
const isColliding = (x1, y1, r1, x2, y2, r2) => {
    const a = (r1 - r2) ** 2;
    const b = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    const c = (r1 + r2) ** 2;

    return a <= b && b <= c;
};

app.ticker.add((dt) => {
    stats.begin();

    for (const colliderA of colliders.get()) {
        for (const colliderB of colliders.get()) {
            if (colliderA.id !== colliderB.id) {
                if (
                    isColliding(
                        colliderA.position.x,
                        colliderA.position.y,
                        colliderA.radius.value,
                        colliderB.position.x,
                        colliderB.position.y,
                        colliderB.radius.value
                    )
                ) {
                    const big =
                        colliderA.radius.value > colliderB.radius.value
                            ? colliderA
                            : colliderB;
                    const small =
                        colliderA.radius.value <= colliderB.radius.value
                            ? colliderA
                            : colliderB;

                    const directionX = small.position.x - big.position.x;
                    const directionY = small.position.y - big.position.y;
                    const magnitude = Math.sqrt(
                        directionX * directionX + directionY * directionY
                    );
                    const normX = directionX / magnitude;
                    const normY = directionY / magnitude;

                    small.velocity.x = normX;
                    small.velocity.y = normY;
                    small.fireEvent('collision', { other: big });
                }
            }
        }
    }

    for (const kinematic of kinematics.get()) {
        kinematic.position.x += kinematic.velocity.x * dt;
        kinematic.position.y += kinematic.velocity.y * dt;

        if (isXOutOfbounds(kinematic.position.x)) {
            kinematic.position.x = kinematic.position.x < 0 ? 0 : 800;
            kinematic.velocity.x *= -1;
        }

        if (isYOutOfbounds(kinematic.position.y)) {
            kinematic.position.y = kinematic.position.y < 0 ? 0 : 600;
            kinematic.velocity.y *= -1;
        }
    }

    graphics.clear();

    for (const circle of circles.get()) {
        graphics.beginFill(`0x${circle.color.value}`);
        graphics.drawCircle(
            circle.position.x,
            circle.position.y,
            circle.radius.value
        );
    }

    graphics.endFill();

    stats.end();
});
