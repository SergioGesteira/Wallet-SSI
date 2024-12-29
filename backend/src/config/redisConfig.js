import { createClient } from 'redis';

// Crear un cliente de Redis
const redisClient = createClient({
    url: 'redis://localhost:6379',  // Usamos el URL para conectarnos a Redis
});

redisClient.connect().then(() => {
    console.log('Conectado a Redis');
});

// Promisificar las funciones de Redis
const getFromRedis = (key) => {
    return redisClient.get(key); // get es ahora un método asíncrono
};

const setInRedis = (key, value, expiryTime = 300) => { // Expiración por defecto de 5 minutos
    return redisClient.set(key, value, {
        EX: expiryTime, // Expiración en segundos
    });
};

export { getFromRedis, setInRedis };
