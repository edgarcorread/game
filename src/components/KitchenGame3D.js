import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import nipplejs from 'nipplejs';

const KitchenGame3D = () => {
  // Variable global para el temporizador - NUEVO
  const timerGlobal = {
    value: 60,  // Valor inicial en segundos
    active: false,
    timerId: null
  };

  const mountRef = useRef(null);
  const joystickRef = useRef(null);
  
  // Posiciones separadas para cada personaje
  const [redPosition, setRedPosition] = useState({ x: -2, y: 0, z: 0 });
  const [bluePosition, setBluePosition] = useState({ x: 2, y: 0, z: 0 });
  const [keyDown, setKeyDown] = useState({
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    a: false,
    s: false,
    d: false,
    z: false,
    x: false,
    c: false
  });
  
  // Estado para el personaje activo que se puede controlar
  const [activeCharacter, setActiveCharacter] = useState('red');
  
  // Estado para los cajones
  const [isRiceDrawerOpen, setIsRiceDrawerOpen] = useState(false);
  const [isFishDrawerOpen, setIsFishDrawerOpen] = useState(false);
  
  // Estado para el inventario de cada personaje
  const [redHasRice, setRedHasRice] = useState(false);
  const [blueHasRice, setBlueHasRice] = useState(false);
  const [redHasFish, setRedHasFish] = useState(false);
  const [blueHasFish, setBlueHasFish] = useState(false);
  
  // Estado para el proceso de corte
  const [cuttingProgress, setCuttingProgress] = useState(0);
  const [isCutting, setIsCutting] = useState(false);
  const [cuttingCharacter, setCuttingCharacter] = useState(null);
  
  // Estado para la puntuación
  const [score, setScore] = useState(0);
  
  // Estado para objetos en el suelo o en muebles
  const [floorItems, setFloorItems] = useState([]);
  
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState('');
  
  // Sistema de pedidos
  const [orders, setOrders] = useState([]);
  const [nextOrderId, setNextOrderId] = useState(1);
  const ordersRef = useRef([]);

  // Estado para el cronómetro y estado del juego
  const [gameTime, setGameTime] = useState(60); // 60 segundos = 1 minuto
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const gameTimerRef = useRef(null);
  const gameTimerIntervalRef = useRef(null); // Referencia para el intervalo del temporizador

  // Función para iniciar el juego - MODIFICADA
  // FUNCIÓN startGame MODIFICADA PARA REINICIO COMPLETO
const startGame = () => {
  // Limpiar cualquier temporizador anterior
  if (gameTimerIntervalRef.current) {
    clearInterval(gameTimerIntervalRef.current);
  }
  
  // Reiniciar posiciones de los personajes
  setRedPosition({ x: -2, y: 0, z: 0 });
  setBluePosition({ x: 2, y: 0, z: 0 });
  
  // Reiniciar inventario de los personajes
  setRedHasRice(false);
  setBlueHasRice(false);
  setRedHasFish(false);
  setBlueHasFish(false);
  
  // Reiniciar variables globales de pescado cortado
  if (window.redHasCutFish) window.redHasCutFish = false;
  if (window.blueHasCutFish) window.blueHasCutFish = false;
  
  // Reiniciar estado del proceso de corte
  setIsCutting(false);
  setCuttingProgress(0);
  setCuttingCharacter(null);
  
  // Reiniciar estado de los cajones
  setIsRiceDrawerOpen(false);
  setIsFishDrawerOpen(false);
  
  // Reiniciar otros estados del juego
  setScore(0);
  setOrders([]);
  setFloorItems([]);
  setNextOrderId(1);
  setGameTime(60);
  setIsGameOver(false);
  setIsGameRunning(true);
  
  // Reiniciar personaje activo
  setActiveCharacter('red');
  
  // Crear un temporizador sencillo como el de los pedidos
  const startTime = Date.now();
  const gameDuration = 60000; // 60 segundos en milisegundos
  
  // Establecer un intervalo para actualizar el tiempo restante cada 100ms
  gameTimerIntervalRef.current = setInterval(() => {
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, Math.floor((gameDuration - elapsedTime) / 1000));
    
    // Actualizar el estado del tiempo de juego
    setGameTime(remainingTime);
    
    // Si se acabó el tiempo, finalizar el juego
    if (remainingTime <= 0) {
      clearInterval(gameTimerIntervalRef.current);
      gameTimerIntervalRef.current = null;
      setIsGameRunning(false);
      setIsGameOver(true);
    }
  }, 100);
};
  // Efecto para monitorear el temporizador - MODIFICADO
  useEffect(() => {
    return () => {
      if (timerGlobal.timerId) {
        clearInterval(timerGlobal.timerId);
        timerGlobal.timerId = null;
        timerGlobal.active = false;
      }
    };
  }, []);

  // Usar la referencia para acceder al valor actualizado en los temporizadores
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);
  
  // Inicializar variables globales para rastrear si el pescado está cortado
  useEffect(() => {
    window.redHasCutFish = false;
    window.blueHasCutFish = false;
    
    return () => {
      delete window.redHasCutFish;
      delete window.blueHasCutFish;
    };
  }, []);
  
  const redCharacterRef = useRef(null);
  const blueCharacterRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const wallsRef = useRef([]);
  const riceDrawerRef = useRef(null);
  const fishDrawerRef = useRef(null);
  const drawerRiceRef = useRef(null);
  const drawerFishRef = useRef(null);
  const riceAboveRedRef = useRef(null);
  const riceAboveBlueRef = useRef(null);
  const fishAboveRedRef = useRef(null);
  const fishAboveBlueRef = useRef(null);
  const cutFishAboveRedRef = useRef(null);
  const cutFishAboveBlueRef = useRef(null);
  const floorItemsRef = useRef([]);
  const tableRef = useRef(null);
  const cuttingBoardRef = useRef(null);
  const progressBarRef = useRef(null);
  const deliveryZoneRef = useRef(null);
  const animationRef = useRef(null);
  const orderDisplaysRef = useRef([]);
  // Generar un pedido aleatorio
  const generateRandomOrder = () => {
    const orderTypes = [
      { type: 'rice', name: 'Arroz', emoji: '🍚' },
      { type: 'cutFish', name: 'Pescado Cortado', emoji: '🍣' },
      
    ];
    
    const randomIndex = Math.floor(Math.random() * orderTypes.length);
    const selectedOrder = orderTypes[randomIndex];
    
    return {
      id: nextOrderId,
      ...selectedOrder,
      timeCreated: Date.now(),
      timeLimit: 15000, // 15 segundos en milisegundos
      isCompleted: false,
      timerId: null
    };
  };
  
  // Verificar si un pedido está completo
  const checkOrderCompletion = (item, onDeliveryZone) => {
    if (!onDeliveryZone || orders.length === 0) return false;
    
    // Revisamos cada pedido activo
    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      if (order.isCompleted) continue;
      
      // Verificamos si el item entregado coincide con el pedido
      if (order.type === 'rice' && item.type === 'rice') {
        completeOrder(order.id, item.type);
        return true;
      } else if (order.type === 'cutFish' && item.type === 'cutFish') {
        completeOrder(order.id, item.type);
        return true;
      } else if (order.type === 'combo') {
        // Para el combo necesitamos verificar si ya hay un componente en la zona de entrega
        const otherItemInDeliveryZone = floorItems.find(
          floorItem => floorItem.onDeliveryZone && floorItem.id !== item.id
        );
        
        if (otherItemInDeliveryZone) {
          const hasRice = (item.type === 'rice' || otherItemInDeliveryZone.type === 'rice');
          const hasCutFish = (item.type === 'cutFish' || otherItemInDeliveryZone.type === 'cutFish');
          
          if (hasRice && hasCutFish) {
            completeOrder(order.id, 'combo');
            return true;
          }
        }
      }
    }
    
    return false;
  };
  
  // Completar un pedido y asignar puntos
  const completeOrder = (orderId, type) => {
    const orderIndex = orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) return;
    
    const order = orders[orderIndex];
    const timeTaken = (Date.now() - order.timeCreated) / 1000; // tiempo en segundos
    
    // Calcular puntos según el tiempo de entrega
    let pointsAwarded = 0;
    let timeMessage = '';
    
    if (timeTaken <= 5) {
      pointsAwarded = 15;
      timeMessage = '¡Excelente tiempo! +15 puntos';
    } else if (timeTaken <= 10) {
      pointsAwarded = 10;
      timeMessage = '¡Buen tiempo! +10 puntos';
    } else if (timeTaken <= 15) {
      pointsAwarded = 5;
      timeMessage = 'Justo a tiempo +5 puntos';
    }
    
    // Actualizar la puntuación
    setScore(prev => prev + pointsAwarded);
    
    // Mostrar mensaje de éxito
    let itemMessage = '';
    if (type === 'rice') itemMessage = 'arroz';
    else if (type === 'cutFish') itemMessage = 'pescado cortado';
    else if (type === 'combo') itemMessage = 'combo de arroz y pescado';
    
    setMessage(`¡Pedido de ${itemMessage} completado! ${timeMessage}`);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 3000);
    
    // Actualizar el estado del pedido
    const updatedOrders = [...orders];
    updatedOrders[orderIndex] = { ...order, isCompleted: true };
    
    // Limpiar el temporizador asociado
    if (order.timerId) {
      clearTimeout(order.timerId);
    }
    
    // Eliminar el pedido completado después de un breve momento
    setTimeout(() => {
      setOrders(orders => orders.filter(o => o.id !== orderId));
      
      // Limpiar TODOS los items de la zona de entrega
      setFloorItems(items => items.filter(item => !item.onDeliveryZone));
    }, 1000);
    
    setOrders(updatedOrders);
  };
  // Función para expirar pedidos no completados
  const expireOrder = (orderId) => {
    setOrders(prevOrders => {
      const orderIndex = prevOrders.findIndex(order => order.id === orderId);
      if (orderIndex === -1) return prevOrders;
      
      // Penalizar con -10 puntos
      setScore(prev => prev - 10);
      
      // Mostrar mensaje
      const expiredOrder = prevOrders[orderIndex];
      setMessage(`¡Pedido de ${expiredOrder.name} expirado! -10 puntos`);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
      
      // Eliminar el pedido expirado
      return prevOrders.filter(o => o.id !== orderId);
    });
  };
  
  // Crear un nuevo pedido cada 10 segundos solo si el juego está activo
  useEffect(() => {
    if (!isGameRunning) return;
    
    const createOrder = () => {
      const newOrder = generateRandomOrder();
      
      // Crear un temporizador para este pedido
      const timerId = setTimeout(() => {
        // Accedemos a los pedidos actuales usando la referencia
        const currentOrders = ordersRef.current;
        const orderToExpire = currentOrders.find(order => order.id === newOrder.id);
        
        if (orderToExpire && !orderToExpire.isCompleted) {
          expireOrder(newOrder.id);
        }
      }, newOrder.timeLimit);
      
      newOrder.timerId = timerId;
      
      setOrders(prev => [...prev, newOrder]);
      setNextOrderId(prev => prev + 1);
    };
    
    // Crear el primer pedido inmediatamente
    createOrder();
    
    // Configurar intervalo para nuevos pedidos cada 10 segundos
    const intervalId = setInterval(createOrder, 10000);
    
    return () => {
      clearInterval(intervalId);
      // Limpiar todos los temporizadores de pedidos al desmontar
      orders.forEach(order => {
        if (order.timerId) clearTimeout(order.timerId);
      });
    };
  }, [isGameRunning]); // Solo ejecutar cuando cambia el estado del juego

  // Función para verificar si un punto está sobre la mesa
  const isOnTable = (position) => {
    if (!tableRef.current) return false;
    
    const tablePosition = tableRef.current.position;
    const tableSize = { x: 4, z: 3 };
    
    return (
      position.x >= tablePosition.x - tableSize.x / 2 &&
      position.x <= tablePosition.x + tableSize.x / 2 &&
      position.z >= tablePosition.z - tableSize.z / 2 &&
      position.z <= tablePosition.z + tableSize.z / 2
    );
  };

  // Función para verificar si un punto está sobre la tabla de picar
  const isOnCuttingBoard = (position) => {
    if (!cuttingBoardRef.current) return false;
    
    const boardPosition = cuttingBoardRef.current.position;
    const boardSize = { x: 1.5, z: 1.0 };
    
    return (
      position.x >= boardPosition.x - boardSize.x / 2 &&
      position.x <= boardPosition.x + boardSize.x / 2 &&
      position.z >= boardPosition.z - boardSize.z / 2 &&
      position.z <= boardPosition.z + boardSize.z / 2
    );
  };
  
  // Función para verificar si un punto está en la zona de entrega
  const isOnDeliveryZone = (position) => {
    if (!deliveryZoneRef.current) return false;
    
    const zonePosition = deliveryZoneRef.current.position;
    const zoneSize = { x: 1, z: 1 };
    
    return (
      position.x >= zonePosition.x - zoneSize.x / 2 &&
      position.x <= zonePosition.x + zoneSize.x / 2 &&
      position.z >= zonePosition.z - zoneSize.z / 2 &&
      position.z <= zonePosition.z + zoneSize.z / 2
    );
  };
  
  // Detectar colisiones
  const checkCollisions = (newPos) => {
    const characterRadius = 0.5;
    
    for (const wall of wallsRef.current) {
      const { position: wallPos, size: wallSize } = wall;
      
      const wallMinX = wallPos.x - wallSize.x / 2;
      const wallMaxX = wallPos.x + wallSize.x / 2;
      const wallMinZ = wallPos.z - wallSize.z / 2;
      const wallMaxZ = wallPos.z + wallSize.z / 2;
      
      if (
        newPos.x + characterRadius > wallMinX &&
        newPos.x - characterRadius < wallMaxX &&
        newPos.z + characterRadius > wallMinZ &&
        newPos.z - characterRadius < wallMaxZ
      ) {
        return true;
      }
    }
    
    return false;
  };
  
  // Efecto para inicializar el joystick
  useEffect(() => {
    if (!joystickRef.current) return;

    const options = {
      zone: joystickRef.current,
      size: 100,
      color: 'blue',
      mode: 'static',
      position: { left: '50%', top: '50%' },
    };

    const manager = nipplejs.create(options);

    manager.on('move', (evt, data) => {
      if (!isGameRunning) return; // No permitir movimiento si el juego no está activo
      
      const { direction } = data;
      if (!direction) return;
      
      const { x, y } = direction;

      if (x > 0.5) {
        setKeyDown(prev => ({ ...prev, ArrowRight: true, ArrowLeft: false }));
      } else if (x < -0.5) {
        setKeyDown(prev => ({ ...prev, ArrowLeft: true, ArrowRight: false }));
      } else {
        setKeyDown(prev => ({ ...prev, ArrowLeft: false, ArrowRight: false }));
      }

      if (y > 0.5) {
        setKeyDown(prev => ({ ...prev, ArrowDown: true, ArrowUp: false }));
      } else if (y < -0.5) {
        setKeyDown(prev => ({ ...prev, ArrowUp: true, ArrowDown: false }));
      } else {
        setKeyDown(prev => ({ ...prev, ArrowUp: false, ArrowDown: false }));
      }
    });

    manager.on('end', () => {
      setKeyDown(prev => ({
        ...prev,
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false,
      }));
    });

    return () => {
      manager.destroy();
    };
  }, [isGameRunning]);

  // Efecto para manejar el cambio de personaje con la tecla 
  useEffect(() => {
    const handleQKeyPress = (e) => {
      if (!isGameRunning) return; // No permitir cambio si el juego no está activo
      
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault();
        setActiveCharacter(prev => prev === 'red' ? 'blue' : 'red');
      }
    };

    window.addEventListener('keydown', handleQKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleQKeyPress);
    };
  }, [isGameRunning]);
  
  // Efecto para manejar la tecla Escape para cancelar el proceso de corte
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isCutting) {
        setIsCutting(false);
        setCuttingCharacter(null);
        setMessage("Proceso de corte cancelado. Puedes retomarlo después.");
        setShowMessage(false);
        
        setTimeout(() => {
          setShowMessage(false);
        }, 3000);
      }
    };
    
    window.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      window.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isCutting]);
  
  // Efecto para manejar la tecla c para cortar
  useEffect(() => {
    const handleXKeyPress = (e) => {
      if (!isGameRunning) return; // No permitir cortar si el juego no está activo
      
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        
        if (isCutting) return;
        
        const currentPosition = activeCharacter === 'red' ? redPosition : bluePosition;
        
        const fishOnCuttingBoard = floorItems.findIndex(item => 
          item.type === 'fish' && item.onCuttingBoard === true
        );
        
        const distToCuttingBoard = Math.sqrt(
          Math.pow(currentPosition.x - cuttingBoardRef.current.position.x, 2) + 
          Math.pow(currentPosition.z - cuttingBoardRef.current.position.z, 2)
        );

        const isNearCuttingBoard = distToCuttingBoard < 3.0;
        
        if (fishOnCuttingBoard !== -1 && isNearCuttingBoard) {
          const currentProgress = floorItems[fishOnCuttingBoard].cuttingProgress || 0;
          
          setIsCutting(true);
          setCuttingCharacter(activeCharacter);
          setCuttingProgress(currentProgress);
          
          setMessage("Cortando pescado...");
          setShowMessage(false);
          
          const intervalId = setInterval(() => {
            setCuttingProgress(prev => {
              const newProgress = prev + 5;
              
              setFloorItems(items => {
                const newItems = [...items];
                if (fishOnCuttingBoard !== -1 && newItems[fishOnCuttingBoard]) {
                  newItems[fishOnCuttingBoard] = {
                    ...newItems[fishOnCuttingBoard],
                    cuttingProgress: newProgress
                  };
                }
                return newItems;
              });
              
              if (newProgress >= 100) {
                clearInterval(intervalId);
                setIsCutting(false);
                setCuttingCharacter(null);
                
                setFloorItems(prev => {
                  const newItems = [...prev];
                  newItems[fishOnCuttingBoard] = {
                    ...newItems[fishOnCuttingBoard],
                    type: 'cutFish',
                    cuttingProgress: 0
                  };
                  return newItems;
                });
                
                setMessage("¡Pescado cortado con éxito!");
                
                setTimeout(() => {
                  setShowMessage(false);
                }, 3000);
                
                return 0;
              }
              return newProgress;
            });
          }, 200);
          
          return () => clearInterval(intervalId);
        } else if (!isNearCuttingBoard) {
          setMessage("Acércate a la tabla de picar para cortar");
          setShowMessage(false);
          
          setTimeout(() => {
            setShowMessage(false);
          }, 3000);
        } else if (fishOnCuttingBoard === -1) {
          setMessage("No hay pescado en la tabla de picar");
          setShowMessage(false);
          
          setTimeout(() => {
            setShowMessage(false);
          }, 3000);
        }
      }
    };

    window.addEventListener('keydown', handleXKeyPress);
    
    return () => {
      window.removeEventListener('keydown', handleXKeyPress);
    };
  }, [activeCharacter, redPosition, bluePosition, floorItems, isCutting, isGameRunning]);
  
  // Efecto para manejar la tecla x para interactuar con objetos
  useEffect(() => {
    const handleZKeyPress = (e) => {
      if (!isGameRunning) return; // No permitir interactuar si el juego no está activo
      
      if (e.key.toLowerCase() === 'x') {
        e.preventDefault();
        
        if (isCutting && cuttingCharacter === activeCharacter) return;
        
        const currentPosition = activeCharacter === 'red' ? redPosition : bluePosition;
        
        const hasRice = activeCharacter === 'red' ? redHasRice : blueHasRice;
        const setHasRice = activeCharacter === 'red' ? setRedHasRice : setBlueHasRice;
        const hasFish = activeCharacter === 'red' ? redHasFish : blueHasFish;
        const setHasFish = activeCharacter === 'red' ? setRedHasFish : setBlueHasFish;
        
        let nearbyItem = null;
        let nearbyItemIndex = -1;
        
        for (let i = 0; i < floorItems.length; i++) {
          const item = floorItems[i];
          const distance = Math.sqrt(
            Math.pow(currentPosition.x - item.x, 2) + 
            Math.pow(currentPosition.z - item.z, 2)
          );
          
          if (distance < 1.5) {
            nearbyItem = item;
            nearbyItemIndex = i;
            break;
          }
        }
        
        if (hasRice || hasFish) {
          const onTable = isOnTable(currentPosition);
          const onDeliveryZone = isOnDeliveryZone(currentPosition);
          
          let onCuttingBoard = false;
          if (cuttingBoardRef.current) {
            const distToCuttingBoard = Math.sqrt(
              Math.pow(currentPosition.x - cuttingBoardRef.current.position.x, 2) + 
              Math.pow(currentPosition.z - cuttingBoardRef.current.position.z, 2)
            );
            if (distToCuttingBoard < 2.0) {
              onCuttingBoard = true;
            }
          }
          
          const surfaceY = onCuttingBoard ? 0.65 : (onTable ? 0.6 : (onDeliveryZone ? 0.01 : 0.01));
          
          let itemX = currentPosition.x;
          let itemZ = currentPosition.z;
          
          if (onCuttingBoard) {
            itemX = cuttingBoardRef.current.position.x;
            itemZ = cuttingBoardRef.current.position.z;
          }
          
          let itemType;
          if (hasRice) {
            itemType = 'rice';
          } else {
            if ((activeCharacter === 'red' && window.redHasCutFish) || 
                (activeCharacter === 'blue' && window.blueHasCutFish)) {
              itemType = 'cutFish';
            } else {
              itemType = 'fish';
            }
          }
          
          // Agregar ID único a los items para rastrearlos
          const newItemId = Date.now();
          setFloorItems(prev => [
            ...prev, 
            {
              id: newItemId,
              type: itemType,
              x: itemX,
              y: surfaceY,
              z: itemZ,
              onTable: onTable || onCuttingBoard, 
              onCuttingBoard: onCuttingBoard,
              onDeliveryZone: onDeliveryZone,
              cuttingProgress: 0
            }
          ]);
          
          if (hasRice) {
            setHasRice(false);
            
            if (onDeliveryZone) {
              // Verificar si completa algún pedido
              const orderCompleted = checkOrderCompletion({ 
                id: newItemId, 
                type: 'rice' 
              }, true);
              
              if (!orderCompleted) {
                setMessage("Has entregado arroz, pero no hay pedido pendiente");
                setShowMessage(true);
                
                setTimeout(() => {
                  setShowMessage(false);
                }, 3000);
              }
            } else {
              const location = onCuttingBoard ? "en la tabla de picar" : onTable ? "en la mesa" : "en el suelo";
              setMessage(`Has colocado el arroz ${location}`);
              setShowMessage(false);
            }
          } else {
            setHasFish(false);
            
            if (onDeliveryZone) {
              // Verificar si completa algún pedido
              const orderCompleted = checkOrderCompletion({ 
                id: newItemId, 
                type: itemType 
              }, true);
              
              if (!orderCompleted) {
                if (itemType === 'cutFish') {
                  setMessage("Has entregado pescado cortado, pero no hay pedido pendiente");
                } else {
                  setMessage("El pescado debe estar cortado para entregarlo");
                }
                setShowMessage(true);
                
                setTimeout(() => {
                  setShowMessage(false);
                }, 3000);
              }
            } else {
              const fishType = itemType === 'cutFish' ? "pescado cortado" : "pescado";
              const location = onCuttingBoard ? "en la tabla de picar" : onTable ? "en la mesa" : "en el suelo";
              setMessage(`Has colocado el ${fishType} ${location}`);
              setShowMessage(false);
            }
          }
          
          setTimeout(() => {
            setShowMessage(false);
          }, 3000);
        }
        else if (nearbyItem) {
          const itemType = nearbyItem.type;
          
          if (itemType === 'fish' && nearbyItem.onCuttingBoard) {
            setMessage("Primero debes cortar el pescado usando la tecla C");
            setShowMessage(false);
            setTimeout(() => {
              setShowMessage(false);
            }, 3000);
            return;
          }
          
          if (itemType === 'rice' && !hasRice) {
            setHasRice(true);
            setFloorItems(prev => prev.filter((_, i) => i !== nearbyItemIndex));
            
            const location = nearbyItem.onCuttingBoard ? "de la tabla de picar" : nearbyItem.onTable ? "de la mesa" : "del suelo";
            setMessage(`¡Has recogido el arroz ${location}!`);
            setShowMessage(false);
            
            setTimeout(() => {
              setShowMessage(false);
            }, 3000);
          } 
          else if ((itemType === 'fish' || itemType === 'cutFish') && !hasFish) {
            setHasFish(true);
            
            if (activeCharacter === 'red') {
              window.redHasCutFish = itemType === 'cutFish';
            } else {
              window.blueHasCutFish = itemType === 'cutFish';
            }
            
            setFloorItems(prev => prev.filter((_, i) => i !== nearbyItemIndex));
            
            const fishType = itemType === 'fish' ? "pescado" : "pescado cortado";
            const location = nearbyItem.onCuttingBoard ? "de la tabla de picar" : nearbyItem.onTable ? "de la mesa" : "del suelo";
            setMessage(`¡Has recogido el ${fishType} ${location}!`);
            setShowMessage(false);
            
            setTimeout(() => {
              setShowMessage(false);
            }, 3000);
          }
          else {
            setMessage(`Ya tienes ${itemType === 'rice' ? 'arroz' : 'pescado'} contigo`);
            setShowMessage(false);
            
            setTimeout(() => {
              setShowMessage(false);
            }, 3000);
          }
        }
        else {
            const riceDrawerPosition = { x: -6, z: -6.5 };
            const distanceToRiceDrawer = Math.sqrt(
              Math.pow(currentPosition.x - riceDrawerPosition.x, 2) + 
              Math.pow(currentPosition.z - riceDrawerPosition.z, 2)
            );
            
            const fishDrawerPosition = { x: -8, z: -6.5 };
            const distanceToFishDrawer = Math.sqrt(
              Math.pow(currentPosition.x - fishDrawerPosition.x, 2) + 
              Math.pow(currentPosition.z - fishDrawerPosition.z, 2)
            );
            
            if (distanceToRiceDrawer < 2 && !hasRice) {
              setIsRiceDrawerOpen(prev => !prev);
              
              if (!isRiceDrawerOpen) {
                setHasRice(true);
                setMessage('¡Has obtenido arroz del cajón!');
                setShowMessage(false);
                
                setTimeout(() => {
                  setShowMessage(false);
                }, 3000);
              }
            } 
            else if (distanceToFishDrawer < 2 && !hasFish) {
              setHasFish(true);
              
              if (activeCharacter === 'red') {
                window.redHasCutFish = false;
              } else {
                window.blueHasCutFish = false;
              }
              
              setMessage('¡Has obtenido pescado del cajón!');
              setShowMessage(false);
              
              setTimeout(() => {
                setShowMessage(false);
              }, 3000);
            }
            else {
              if (hasRice && distanceToRiceDrawer < 2) {
                setMessage('Ya tienes arroz contigo');
              } 
              else if (hasFish && distanceToFishDrawer < 2) {
                setMessage('Ya tienes pescado contigo');
              }
              else {
                setMessage('Debes acercarte más a un cajón para obtener un item');
              }
              
              setShowMessage(false);
              
              setTimeout(() => {
                setShowMessage(false);
              }, 3000);
            }
          }
        }
      };
  
      window.addEventListener('keydown', handleZKeyPress);
      
      return () => {
        window.removeEventListener('keydown', handleZKeyPress);
      };
    }, [activeCharacter, redPosition, bluePosition, isRiceDrawerOpen, isFishDrawerOpen, 
        redHasRice, blueHasRice, redHasFish, blueHasFish, floorItems, isCutting, cuttingCharacter, score, orders, isGameRunning]);
    
  // Manejar el movimiento solo del personaje activo
  useEffect(() => {
    // No permitir movimiento si el juego no está activo
    if (!isGameRunning) return;
    
    const moveCharacter = () => {
      if (isCutting && cuttingCharacter === activeCharacter) return;
      
      const speed = 0.5;
      
      const currentPosition = activeCharacter === 'red' ? redPosition : bluePosition;
      const setCurrentPosition = activeCharacter === 'red' ? setRedPosition : setBluePosition;
      
      let newX = currentPosition.x;
      let newZ = currentPosition.z;
      
      if (keyDown.ArrowUp || keyDown.w) {
        newZ -= speed;
      }
      if (keyDown.ArrowDown || keyDown.s) {
        newZ += speed;
      }
      if (keyDown.ArrowLeft || keyDown.a) {
        newX -= speed;
      }
      if (keyDown.ArrowRight || keyDown.d) {
        newX += speed;
      }
      
      const newPosition = { x: newX, y: currentPosition.y, z: newZ };
      if (!checkCollisions(newPosition)) {
        setCurrentPosition(newPosition);
        
        const characterRef = activeCharacter === 'red' ? redCharacterRef : blueCharacterRef;
        if (characterRef.current) {
          characterRef.current.position.set(newX, currentPosition.y, newZ);
        }
      }
    };
    
    const isAnyKeyPressed = Object.values(keyDown).some(key => key);
    
    if (isAnyKeyPressed) {
      const intervalId = setInterval(moveCharacter, 16);
      return () => clearInterval(intervalId);
    }
  }, [keyDown, redPosition, bluePosition, activeCharacter, isCutting, cuttingCharacter, isGameRunning]);
  
  // Manejar eventos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Siempre permitir teclas de iniciar juego incluso cuando el juego no está activo
      if (e.key === ' ' && !isGameRunning) {
        startGame();
        return;
      }
      
      // No procesar otras teclas si el juego no está activo
      if (!isGameRunning && !isGameOver) return;
      
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'z', 'x', 'c'].includes(key)) {
        e.preventDefault();
        
        setKeyDown(prev => {
          const newState = { ...prev };
          
          if (key === 'arrowup') newState.ArrowUp = true;
          else if (key === 'arrowdown') newState.ArrowDown = true;
          else if (key === 'arrowleft') newState.ArrowLeft = true;
          else if (key === 'arrowright') newState.ArrowRight = true;
          else newState[key] = true;
          
          return newState;
        });
      }
    };
    
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', 'z', 'x'].includes(key)) {
        e.preventDefault();
        
        setKeyDown(prev => {
          const newState = { ...prev };
          
          if (key === 'arrowup') newState.ArrowUp = false;
          else if (key === 'arrowdown') newState.ArrowDown = false;
          else if (key === 'arrowleft') newState.ArrowLeft = false;
          else if (key === 'arrowright') newState.ArrowRight = false;
          else newState[key] = false;
          
          return newState;
        });
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isGameRunning, isGameOver, startGame]);
  
  // Inicializar y configurar Three.js
  useEffect(() => {
    if (!mountRef.current) return;
    
    const mountElement = mountRef.current;
    
    // Crear escena
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    
    // Crear cámara
    const camera = new THREE.PerspectiveCamera(
      60, 
      mountElement.clientWidth / mountElement.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 7, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    
    // Crear renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
    renderer.shadowMap.enabled = true;
    mountElement.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Crear suelo
    const floorGeometry = new THREE.PlaneGeometry(20, 15);
    const floorMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xeeeeee,
      roughness: 0.8
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.5;
    floor.receiveShadow = true;
    scene.add(floor);
    
    // Función para crear paredes y obstáculos
    const createWall = (width, height, depth, x, y, z, color = 0xbcaaa4) => {
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshStandardMaterial({ 
        color,
        roughness: 0.7
      });
      const wall = new THREE.Mesh(geometry, material);
      wall.position.set(x, y, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      scene.add(wall);
      
      wallsRef.current.push({
        position: { x, y, z },
        size: { x: width, y: height, z: depth }
      });
      
      return wall;
    };
    
    // Crear las paredes de la cocina
    createWall(20, 1, 0.5, 0, 0, -7.5);
    createWall(0.5, 1, 15, -10, 0, 0);
    createWall(0.5, 1, 15, 10, 0, 0);
    createWall(20, 1, 0.5, 0, 0, 7.5);
    
    // Muebles de cocina
    createWall(4, 1.5, 2, -3, 0.25, -6, 0x424242);
    const table = createWall(4, 1, 3, 5, 0, 0, 0x8d6e63);
    tableRef.current = table;
    createWall(3, 1.5, 2, 3, 0.25, -6, 0x90caf9);
    createWall(8, 1.5, 1.5, 0, 0.25, -6.5, 0x795548);
    
    // Crear tabla de picar en la mesa
    const cuttingBoardGeometry = new THREE.BoxGeometry(1.2, 0.1, 0.8);
    const cuttingBoardMaterial = new THREE.MeshStandardMaterial({
      color: 0xf5f5dc,
      roughness: 0.5
    });
    const cuttingBoard = new THREE.Mesh(cuttingBoardGeometry, cuttingBoardMaterial);
    cuttingBoard.position.set(5, 0.55, 1.3);
    cuttingBoard.castShadow = true;
    cuttingBoard.receiveShadow = true;
    scene.add(cuttingBoard);
    cuttingBoardRef.current = cuttingBoard;
    
    // Crear zona de entrega (plato)
    const deliveryZoneGeometry = new THREE.CylinderGeometry(1, 1, 0.1, 32);
    const deliveryZoneMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFD700,
      roughness: 0.3,
      metalness: 0.1
    });
    const deliveryZone = new THREE.Mesh(deliveryZoneGeometry, deliveryZoneMaterial);
    deliveryZone.position.set(-0.3, -0.3, 6);
    deliveryZone.castShadow = true;
    deliveryZone.receiveShadow = true;
    scene.add(deliveryZone);
    deliveryZoneRef.current = deliveryZone;

    // Añadir texto "ENTREGA" sobre la zona de entrega
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 256, 256);
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ENTREGA', 128, 128);

    const deliveryTextTexture = new THREE.CanvasTexture(canvas);
    const deliveryTextMaterial = new THREE.MeshBasicMaterial({
      map: deliveryTextTexture,
      transparent: true
    });
    const deliveryTextGeometry = new THREE.PlaneGeometry(2, 0.5);
    const deliveryTextMesh = new THREE.Mesh(deliveryTextGeometry, deliveryTextMaterial);
    
    scene.add(deliveryTextMesh);
    
    // Crear el cajón de arroz
    const riceDrawerGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
    const drawerMaterial = new THREE.MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.7
    });
    const riceDrawer = new THREE.Mesh(riceDrawerGeometry, drawerMaterial);
    riceDrawer.position.set(-6, 0, -6.5);
    riceDrawer.castShadow = true;
    riceDrawer.receiveShadow = true;
    scene.add(riceDrawer);
    riceDrawerRef.current = riceDrawer;
    
    wallsRef.current.push({
      position: { x: -6, y: 0, z: -6.5 },
      size: { x: 1.5, y: 0.8, z: 1 }
    });
    
    // Crear el cajón de pescado
    const fishDrawerGeometry = new THREE.BoxGeometry(1.5, 0.8, 1);
    const fishDrawer = new THREE.Mesh(fishDrawerGeometry, drawerMaterial);
    fishDrawer.position.set(-8, 0, -6.5);
    fishDrawer.castShadow = true;
    fishDrawer.receiveShadow = true;
    scene.add(fishDrawer);
    fishDrawerRef.current = fishDrawer;
    
    wallsRef.current.push({
      position: { x: -8, y: 0, z: -6.5 },
      size: { x: 1.5, y: 0.8, z: 1 }
    });
    
    // Función para crear emoji en un canvas
    const createEmojiTexture = (emoji) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, 256, 256);
      ctx.fillStyle = 'black';
      ctx.font = 'bold 150px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(emoji, 128, 128);
      
      return new THREE.CanvasTexture(canvas);
    };
    
    // Crear texturas para los iconos de temporizador
    const createTimerTexture = (timeLeft) => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      
      // Fondo transparente
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.fillRect(0, 0, 256, 256);
      
      // Dibujar círculo de fondo
      ctx.beginPath();
      ctx.arc(128, 128, 100, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fill();
      
      // Dibujar el texto del tiempo
      ctx.fillStyle = 'white';
      ctx.font = 'bold 120px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.ceil(timeLeft), 128, 128);
      
      return new THREE.CanvasTexture(canvas);
    };
    
    // Crear texturas de emoji
    const riceTexture = createEmojiTexture('🍚');
    const fishTexture = createEmojiTexture('🐟');
    const cutFishTexture = createEmojiTexture('🍣');
    const knifeTexture = createEmojiTexture('🔪'); 
    const bellTexture = createEmojiTexture('🛎️');

    // Crear etiqueta "🍚" (emoji de arroz) sobre el cajón de arroz
    const riceTextMaterial = new THREE.MeshBasicMaterial({
      map: riceTexture,
      transparent: true
    });
    const riceTextGeometry = new THREE.PlaneGeometry(1, 1);
    const riceTextMesh = new THREE.Mesh(riceTextGeometry, riceTextMaterial);
    riceTextMesh.position.set(-5.5, 1.2, -5.5);
    riceTextMesh.rotation.x = 0;
    scene.add(riceTextMesh);
    
    // Crear etiqueta "🐟" (emoji de pescado) sobre el cajón de pescado
    const fishTextMaterial = new THREE.MeshBasicMaterial({
      map: fishTexture,
      transparent: true
    });
    const fishTextGeometry = new THREE.PlaneGeometry(1, 1);
    const fishTextMesh = new THREE.Mesh(fishTextGeometry, fishTextMaterial);
    fishTextMesh.position.set(-7.5, 1, -6);
    fishTextMesh.rotation.x = 0;
    scene.add(fishTextMesh);
    
    // Crear el arroz dentro del cajón
    const drawerRiceGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.6);
    const drawerRiceMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5
    });
    const drawerRiceMesh = new THREE.Mesh(drawerRiceGeometry, drawerRiceMaterial);
    drawerRiceMesh.position.set(-6, 0.1, -6.5);
    drawerRiceMesh.visible = false;
    scene.add(drawerRiceMesh);
    drawerRiceRef.current = drawerRiceMesh;
    
    // Crear el pescado dentro del cajón
    const drawerFishGeometry = new THREE.BoxGeometry(0.8, 0.3, 0.6);
    const drawerFishMaterial = new THREE.MeshStandardMaterial({
      color: 0x4682B4,
      roughness: 0.5
    });
    const drawerFishMesh = new THREE.Mesh(drawerFishGeometry, drawerFishMaterial);
    drawerFishMesh.position.set(-8, 0.1, -6.5);
    drawerFishMesh.visible = false;
    scene.add(drawerFishMesh);
    drawerFishRef.current = drawerFishMesh;

    // Crear el cuchillo sobre tabla de cortar
    const knifeTextMaterial = new THREE.MeshBasicMaterial({
      map: knifeTexture,
      transparent: true
    });
    const knifeTextGeometry = new THREE.PlaneGeometry(1, 1);
    const knifeTextMesh = new THREE.Mesh(knifeTextGeometry, knifeTextMaterial);
    knifeTextMesh.position.set(5, 1.2, 1.3);
    knifeTextMesh.rotation.x = 0;
    scene.add(knifeTextMesh);

    // Crear el cuchillo sobre tabla de cortar
    const bellTextMaterial = new THREE.MeshBasicMaterial({
      map: bellTexture,
      transparent: true
    });
    const bellTextGeometry = new THREE.PlaneGeometry(1, 1);
    const bellTextMesh = new THREE.Mesh(bellTextGeometry, bellTextMaterial);
    bellTextMesh.position.set(0.5, 0.2, 5.2);
    bellTextMesh.rotation.x = 0;
    scene.add(bellTextMesh);
    
    // Crear área de visualización de pedidos
    const orderDisplayArea = createWall(8, 0.2, 1, 0, 2.5, -7, 0x333333);
    
    // Crear personaje rojo (esfera roja brillante)
    const redCharacterGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const redCharacterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.3,
      roughness: 0.3
    });
    const redCharacter = new THREE.Mesh(redCharacterGeometry, redCharacterMaterial);
    redCharacter.position.set(redPosition.x, redPosition.y, redPosition.z);
    redCharacter.castShadow = true;
    scene.add(redCharacter);
    redCharacterRef.current = redCharacter;
    
    // Crear personaje azul (esfera azul brillante)
    const blueCharacterGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const blueCharacterMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x0066ff,
      emissive: 0x0066ff,
      emissiveIntensity: 0.3,
      roughness: 0.3
    });
    const blueCharacter = new THREE.Mesh(blueCharacterGeometry, blueCharacterMaterial);
    blueCharacter.position.set(bluePosition.x, bluePosition.y, bluePosition.z);
    blueCharacter.castShadow = true;
    scene.add(blueCharacter);
    blueCharacterRef.current = blueCharacter;

    // Crear arroz encima de los personajes
    const riceAboveRedGeometry = new THREE.PlaneGeometry(0.8, 0.8);
    const riceAboveRedMaterial = new THREE.MeshBasicMaterial({
      map: riceTexture,
      transparent: true,
      depthTest: false
    });
    const riceAboveRedMesh = new THREE.Mesh(riceAboveRedGeometry, riceAboveRedMaterial);
    riceAboveRedMesh.visible = false;
    scene.add(riceAboveRedMesh);
    riceAboveRedRef.current = riceAboveRedMesh;
    
    const riceAboveBlueGeometry = new THREE.PlaneGeometry(0.8, 0.8);
    const riceAboveBlueMaterial = new THREE.MeshBasicMaterial({
      map: riceTexture,
      transparent: true,
      depthTest: false
    });
    const riceAboveBlueMesh = new THREE.Mesh(riceAboveBlueGeometry, riceAboveBlueMaterial);
    riceAboveBlueMesh.visible = false;
    scene.add(riceAboveBlueMesh);
    riceAboveBlueRef.current = riceAboveBlueMesh;
    
    // Crear pescado encima de los personajes
    const fishAboveRedGeometry = new THREE.PlaneGeometry(0.8, 0.8);
    const fishAboveRedMaterial = new THREE.MeshBasicMaterial({
      map: fishTexture,
      transparent: true,
      depthTest: false
    });
    const fishAboveRedMesh = new THREE.Mesh(fishAboveRedGeometry, fishAboveRedMaterial);
    fishAboveRedMesh.visible = false;
    scene.add(fishAboveRedMesh);
    fishAboveRedRef.current = fishAboveRedMesh;
    
    const fishAboveBlueGeometry = new THREE.PlaneGeometry(0.8, 0.8);
    const fishAboveBlueMaterial = new THREE.MeshBasicMaterial({
      map: fishTexture,
      transparent: true,
      depthTest: false
    });
    const fishAboveBlueMesh = new THREE.Mesh(fishAboveBlueGeometry, fishAboveBlueMaterial);
    fishAboveBlueMesh.visible = false;
    scene.add(fishAboveBlueMesh);
    fishAboveBlueRef.current = fishAboveBlueMesh;
    
    // Crear pescado cortado encima de los personajes
    const cutFishAboveRedGeometry = new THREE.PlaneGeometry(0.8, 0.8);
    const cutFishAboveRedMaterial = new THREE.MeshBasicMaterial({
      map: cutFishTexture,
      transparent: true,
      depthTest: false
    });
    const cutFishAboveRedMesh = new THREE.Mesh(cutFishAboveRedGeometry, cutFishAboveRedMaterial);
    cutFishAboveRedMesh.visible = false;
    scene.add(cutFishAboveRedMesh);
    cutFishAboveRedRef.current = cutFishAboveRedMesh;
    
    const cutFishAboveBlueGeometry = new THREE.PlaneGeometry(0.8, 0.8);
    const cutFishAboveBlueMaterial = new THREE.MeshBasicMaterial({
      map: cutFishTexture,
      transparent: true,
      depthTest: false
    });
    const cutFishAboveBlueMesh = new THREE.Mesh(cutFishAboveBlueGeometry, cutFishAboveBlueMaterial);
    cutFishAboveBlueMesh.visible = false;
    scene.add(cutFishAboveBlueMesh);
    cutFishAboveBlueRef.current = cutFishAboveBlueMesh;
    
    // Crear barra de progreso para el corte
    const progressBarBgGeometry = new THREE.PlaneGeometry(1, 0.2);
    const progressBarBgMaterial = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.5,
      depthTest: false
    });
    const progressBarBg = new THREE.Mesh(progressBarBgGeometry, progressBarBgMaterial);
    progressBarBg.visible = false;
    scene.add(progressBarBg);
    
    const progressBarGeometry = new THREE.PlaneGeometry(1, 0.2);
    const progressBarMaterial = new THREE.MeshBasicMaterial({
      color: 0x00FF00,
      transparent: true,
      depthTest: false
    });
    const progressBar = new THREE.Mesh(progressBarGeometry, progressBarMaterial);
    progressBar.visible = false;
    progressBar.scale.x = 0;
    scene.add(progressBar);
    progressBarRef.current = { bg: progressBarBg, bar: progressBar };
    
    // Función para limpiar todos los items del suelo
    const cleanupFloorItems = () => {
      floorItemsRef.current.forEach(mesh => {
        if (mesh && scene.children.includes(mesh)) {
          scene.remove(mesh);
        }
      });
      
      floorItemsRef.current = [];
    };
    
    // Función para limpiar las visualizaciones de pedidos
    const cleanupOrderDisplays = () => {
      orderDisplaysRef.current.forEach(orderDisplay => {
        if (orderDisplay.icon && scene.children.includes(orderDisplay.icon)) {
          scene.remove(orderDisplay.icon);
        }
        if (orderDisplay.timer && scene.children.includes(orderDisplay.timer)) {
          scene.remove(orderDisplay.timer);
        }
        if (orderDisplay.background && scene.children.includes(orderDisplay.background)) {
          scene.remove(orderDisplay.background);
        }
      });
      
      orderDisplaysRef.current = [];
    };
    
    // NUEVO: Crear cronómetro del juego en 3D - MODIFICADO CON LA NUEVA FUNCIÓN
    const createGameTimerTexture = (timeLeft) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      
      // Fondo transparente con un poco de opacidad
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, 0, 512, 256);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 5;
      ctx.strokeRect(10, 10, 492, 236);
      
      // Texto del tiempo - Asegurar que timeLeft es un número válido
      const safeTimeLeft = typeof timeLeft === 'number' ? Math.max(0, timeLeft) : 60;
      const minutes = Math.floor(safeTimeLeft / 60);
      const seconds = Math.floor(safeTimeLeft % 60);
      const timeString = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      
      ctx.font = 'bold 100px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(timeString, 256, 128);
      
      return new THREE.CanvasTexture(canvas);
    };
    
    // Crear el panel de tiempo de juego
    const gameTimerGeometry = new THREE.PlaneGeometry(4, 1);
    let gameTimerTexture = createGameTimerTexture(gameTime);
    const gameTimerMaterial = new THREE.MeshBasicMaterial({
      map: gameTimerTexture,
      transparent: true
    });
    const gameTimerMesh = new THREE.Mesh(gameTimerGeometry, gameTimerMaterial);
    gameTimerMesh.position.set(0, 4, -7);
    gameTimerMesh.visible = false; // Oculto hasta que inicie el juego
    scene.add(gameTimerMesh);
    gameTimerRef.current = gameTimerMesh;
    
    // Función de animación
    const animate = () => {
      // Actualizar las posiciones de los personajes
      if (redCharacterRef.current) {
        redCharacterRef.current.position.set(redPosition.x, redPosition.y, redPosition.z);
      }
      if (blueCharacterRef.current) {
        blueCharacterRef.current.position.set(bluePosition.x, bluePosition.y, bluePosition.z);
      }
      
      // Destacar visualmente el personaje activo
      if (redCharacterRef.current && blueCharacterRef.current) {
        if (activeCharacter === 'red') {
          redCharacterRef.current.material.emissiveIntensity = 0.5;
          blueCharacterRef.current.material.emissiveIntensity = 0.2;
        } else {
          redCharacterRef.current.material.emissiveIntensity = 0.2;
          blueCharacterRef.current.material.emissiveIntensity = 0.5;
        }
      }
      
      // Mostrar el temporizador del juego - MODIFICADO PARA USAR VARIABLE GLOBAL
      if (isGameRunning && gameTimerRef.current) {
        gameTimerRef.current.visible = true;
        // Actualizar la textura del temporizador usando el valor global
        const newTimerTexture = createGameTimerTexture(timerGlobal.value);
        gameTimerRef.current.material.map = newTimerTexture;
        gameTimerRef.current.material.needsUpdate = true;
      } else if (gameTimerRef.current) {
        gameTimerRef.current.visible = false;
      }
      
      // Animación de apertura/cierre del cajón de arroz
      if (riceDrawerRef.current) {
        if (isRiceDrawerOpen) {
          riceDrawerRef.current.position.z = -6.5;
          if (drawerRiceRef.current) {
            drawerRiceRef.current.visible = true;
            drawerRiceRef.current.position.z = -6.5;
          }
        } else {
          riceDrawerRef.current.position.z = -6.5;
          if (drawerRiceRef.current) {
            drawerRiceRef.current.visible = false;
            drawerRiceRef.current.position.z = -6.5;
          }
        }
      }
      
      // Animación de apertura/cierre del cajón de pescado
      if (fishDrawerRef.current) {
        if (isFishDrawerOpen) {
          fishDrawerRef.current.position.z = -6.5;
          if (drawerFishRef.current) {
            drawerFishRef.current.visible = true;
            drawerFishRef.current.position.z = -6.5;
          }
        } else {
          fishDrawerRef.current.position.z = -6.5;
          if (drawerFishRef.current) {
            drawerFishRef.current.visible = false;
            drawerFishRef.current.position.z = -6.5;
          }
        }
      }
      
      // Actualizar los items del personaje rojo
      if (riceAboveRedRef.current) {
        riceAboveRedRef.current.visible = redHasRice;
        if (redHasRice && redCharacterRef.current) {
          riceAboveRedRef.current.position.set(
            redPosition.x,
            redPosition.y + 1,
            redPosition.z
          );
          riceAboveRedRef.current.lookAt(camera.position);
        }
      }
      
      // Actualizar pescado normal o pescado cortado dependiendo del estado global
      if (fishAboveRedRef.current && cutFishAboveRedRef.current) {
        const showNormalFish = redHasFish && !window.redHasCutFish;
        const showCutFish = redHasFish && window.redHasCutFish;
        
        fishAboveRedRef.current.visible = showNormalFish;
        cutFishAboveRedRef.current.visible = showCutFish;
        
        if (redHasFish && redCharacterRef.current) {
          const pos = {
            x: redPosition.x,
            y: redPosition.y + 1,
            z: redPosition.z
          };
          
          if (showNormalFish) {
            fishAboveRedRef.current.position.set(pos.x, pos.y, pos.z);
            fishAboveRedRef.current.lookAt(camera.position);
          }
          
          if (showCutFish) {
            cutFishAboveRedRef.current.position.set(pos.x, pos.y, pos.z);
            cutFishAboveRedRef.current.lookAt(camera.position);
          }
        }
      }
      
      // Actualizar los items del personaje azul
      if (riceAboveBlueRef.current) {
        riceAboveBlueRef.current.visible = blueHasRice;
        if (blueHasRice && blueCharacterRef.current) {
          riceAboveBlueRef.current.position.set(
            bluePosition.x,
            bluePosition.y + 1,
            bluePosition.z
          );
          riceAboveBlueRef.current.lookAt(camera.position);
        }
      }

      // Actualizar pescado normal o pescado cortado dependiendo del estado global
      if (fishAboveBlueRef.current && cutFishAboveBlueRef.current) {
        const showNormalFish = blueHasFish && !window.blueHasCutFish;
        const showCutFish = blueHasFish && window.blueHasCutFish;
        
        fishAboveBlueRef.current.visible = showNormalFish;
        cutFishAboveBlueRef.current.visible = showCutFish;
        
        if (blueHasFish && blueCharacterRef.current) {
          const pos = {
            x: bluePosition.x,
            y: bluePosition.y + 1,
            z: bluePosition.z
          };
          
          if (showNormalFish) {
            fishAboveBlueRef.current.position.set(pos.x, pos.y, pos.z);
            fishAboveBlueRef.current.lookAt(camera.position);
          }
          
          if (showCutFish) {
            cutFishAboveBlueRef.current.position.set(pos.x, pos.y, pos.z);
            cutFishAboveBlueRef.current.lookAt(camera.position);
          }
        }
      }
    
      // Actualizar la barra de progreso
      if (progressBarRef.current && cuttingCharacter) {
        const { bg, bar } = progressBarRef.current;
        const position = cuttingCharacter === 'red' ? redPosition : bluePosition;
        
        if (isCutting) {
          bg.visible = true;
          bar.visible = true;
          
          bg.position.set(position.x, position.y + 1.5, position.z);
          bar.position.copy(bg.position);
          
          bg.lookAt(camera.position);
          bar.lookAt(camera.position);
          
          bar.scale.x = cuttingProgress / 100; 
          
          const halfWidth = 0.5 - (bar.scale.x / 2);
          bar.position.x = position.x - halfWidth;
        } else {
          bg.visible = false;
          bar.visible = false;
        }
      }
      
      // Actualizar visualización de pedidos
      cleanupOrderDisplays();
      
      // Crear visualizaciones para pedidos activos solo si el juego está activo
      if (isGameRunning) {
        orders.forEach((order, index) => {
          // Calcular posición en la parte superior
          const posX = -3 + (index * 2);
          const posY = 3.5;
          const posZ = -7;
          
          // Crear fondo del pedido
          const bgGeometry = new THREE.PlaneGeometry(1.5, 1.5);
          const bgColor = order.isCompleted ? 0x00FF00 : 0x333333; // Verde si está completado
          const bgMaterial = new THREE.MeshBasicMaterial({
            color: bgColor,
            transparent: true,
            opacity: 0.7
          });
          const bgMesh = new THREE.Mesh(bgGeometry, bgMaterial);
          bgMesh.position.set(posX, posY, posZ);
          scene.add(bgMesh);
          
          // Crear icono del pedido
          const iconGeometry = new THREE.PlaneGeometry(1, 1);
          let iconTexture;
          
          if (order.type === 'rice') {
            iconTexture = riceTexture;
          } else if (order.type === 'cutFish') {
            iconTexture = cutFishTexture;
          } else if (order.type === 'combo') {
            // Para el combo, usar un canvas con ambos emojis
            const comboCanvas = document.createElement('canvas');
            comboCanvas.width = 256;
            comboCanvas.height = 256;
            const comboCtx = comboCanvas.getContext('2d');
            comboCtx.fillStyle = 'rgba(0, 0, 0, 0)';
            comboCtx.fillRect(0, 0, 256, 256);
            comboCtx.fillStyle = 'black';
            comboCtx.font = 'bold 100px Arial';
            comboCtx.textAlign = 'center';
            comboCtx.textBaseline = 'middle';
            comboCtx.fillText('🍚', 90, 128);
            comboCtx.fillText('🍣', 180, 128);
            
            iconTexture = new THREE.CanvasTexture(comboCanvas);
          }
          
          const iconMaterial = new THREE.MeshBasicMaterial({
            map: iconTexture,
            transparent: true
          });
          const iconMesh = new THREE.Mesh(iconGeometry, iconMaterial);
          iconMesh.position.set(posX, posY + 0.1, posZ);
          scene.add(iconMesh);
          
          // Crear temporizador solo si no está completado
          if (!order.isCompleted) {
            // Calcular tiempo restante en segundos
            const elapsed = (Date.now() - order.timeCreated) / 1000;
            const timeLeftSec = Math.max(0, order.timeLimit / 1000 - elapsed);
            
            // Crear material con textura de temporizador
            const timerGeometry = new THREE.PlaneGeometry(0.6, 0.6);
            const timerTexture = createTimerTexture(timeLeftSec);
            const timerMaterial = new THREE.MeshBasicMaterial({
              map: timerTexture,
              transparent: true
            });
            const timerMesh = new THREE.Mesh(timerGeometry, timerMaterial);
            timerMesh.position.set(posX, posY - 0.6, posZ);
            scene.add(timerMesh);
            
            // Guardar referencia al timer
            orderDisplaysRef.current.push({
              id: order.id,
              icon: iconMesh,
              timer: timerMesh,
              background: bgMesh
            });
          } else {
            // Si está completado, solo guardar icono y fondo
            orderDisplaysRef.current.push({
              id: order.id,
              icon: iconMesh,
              background: bgMesh
            });
          }
        });
      }
      
      // Actualizar items en el suelo
      cleanupFloorItems();
      
      floorItems.forEach(item => {
        // No renderizar ítems que están en pedidos completados y en la zona de entrega
        if (item.onDeliveryZone && orders.some(order => order.isCompleted)) {
          return; // Saltar este ítem
        }
        
        let itemGeometry = new THREE.PlaneGeometry(0.8, 0.8);
        
        let texture;
        if (item.type === 'rice') {
          texture = riceTexture;
        } else if (item.type === 'fish') {
          texture = fishTexture;
        } else if (item.type === 'cutFish') {
          texture = cutFishTexture;
        }
        
        let itemMaterial = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true
        });
        let itemMesh = new THREE.Mesh(itemGeometry, itemMaterial);
        
        itemMesh.position.set(item.x, item.y, item.z);
        
        itemMesh.rotation.x = -Math.PI / 2;
        
        if (item.onCuttingBoard) {
          itemMesh.position.y += 0.05;
        }
        
        if (item.onDeliveryZone) {
          itemMesh.position.y += 0.05;
        }
        
        scene.add(itemMesh);
        
        floorItemsRef.current.push(itemMesh);
      });
      
      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Iniciar animación
    animate();
    
    // Manejar redimensionamiento
    const handleResize = () => {
      if (!mountElement || !camera || !renderer) return;
      
      camera.aspect = mountElement.clientWidth / mountElement.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountElement.clientWidth, mountElement.clientHeight);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Limpieza
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountElement && rendererRef.current) {
        mountElement.removeChild(rendererRef.current.domElement);
      }
      // Limpiar el temporizador del juego
      if (timerGlobal.timerId) {
        clearInterval(timerGlobal.timerId);
        timerGlobal.timerId = null;
      }
    };
  }, [redPosition, bluePosition, activeCharacter, isRiceDrawerOpen, isFishDrawerOpen, 
      redHasRice, blueHasRice, redHasFish, blueHasFish, floorItems, isCutting, cuttingProgress, 
      cuttingCharacter, orders, gameTime, isGameRunning]);

  return (
    <div className="flex flex-col items-center justify-center p-4">
      
      
      
      {/* Mostrar el progreso de corte si está activo */}
      {isCutting && (
        <div className="mb-4 p-2 bg-green-100 rounded text-center w-full max-w-md">
          <div className="w-full bg-gray-300 h-4 rounded-full mt-1">
            <div 
              className="bg-green-500 h-4 rounded-full" 
              style={{ width: `${cuttingProgress}%` }}
            ></div>
          </div>
          <button 
            className="mt-2 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            onClick={() => {
              setIsCutting(false);
              setCuttingCharacter(null);
              setMessage("Proceso de corte cancelado. Puedes retomarlo después.");
              setShowMessage(false);
              
              setTimeout(() => {
                setShowMessage(false);
              }, 3000);
            }}
          >
            Cancelar corte (Esc)
          </button>
        </div>
      )}
      
      {/* Mensaje de notificación */}
      {showMessage && (
        <div className="mb-4 p-2 bg-yellow-300 rounded text-center w-full max-w-md font-bold">
          {message}
        </div>
      )}

      
      {/* Estructura de tres columnas */}
      <table style={{ width: '100%', border: 'none', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            {/* Columna izquierda: Botones de interacción */}
            <td style={{ width: '15%', verticalAlign: 'middle', padding: '0 10px' }}>
              <div className="flex flex-col space-y-4">
                <button 
                  className="px-3 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                  style={{ minHeight: '50px' ,minWidth: '120px' }}
                  onClick={() => setActiveCharacter(prev => prev === 'red' ? 'blue' : 'red')}
                  disabled={!isGameRunning}
                >
                  {activeCharacter === 'red' ? 'cambiar AZUL' : 'cambiar ROJO'} (z)
                </button>
                
                <button 
                  className="px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  style={{ minHeight: '50px' ,minWidth: '120px' }}
                  onClick={() => {
                    const event = new KeyboardEvent('keydown', { key: 'x' });
                    window.dispatchEvent(event);
                  }}
                  disabled={!isGameRunning}
                >
                  Tomar/Poner (x)
                </button>
                
                <button 
                  className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  style={{ minHeight: '50px' ,minWidth: '120px' }}
                  onClick={() => {
                    const event = new KeyboardEvent('keydown', { key: 'c' });
                    window.dispatchEvent(event);
                  }}
                  disabled={!isGameRunning || isCutting}
                >
                  Cortar (c)
                </button>
              </div>
            </td>
            
            {/* Columna central: Canvas del juego */}
            <td style={{ width: '70%', verticalAlign: 'middle', padding: '0' }}>
              <div 
                ref={mountRef}
                className="border-2 border-gray-400 rounded mx-auto"
                style={{ width: '100%', height: '60vh' }}
                onKeyDown={(e) => e.preventDefault()}
                onKeyUp={(e) => e.preventDefault()}
                tabIndex="0"
              />
            </td>
            
            {/* Columna derecha: Controles de dirección */}
            <td style={{ width: '15%', verticalAlign: 'middle', padding: '0' }}>
              <div className="flex flex-col items-center w-full h-full">
                {/* Fila superior - Flecha arriba */}
                <div className="w-full mb-1">
                  <button 
                    className="bg-gray-300 hover:bg-gray-400 rounded text-center w-full h-24 text-4xl font-bold"
                    style={{ minHeight: '70px' ,minWidth: '180px' }}
                    disabled={!isGameRunning}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowUp: true}));
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowUp: false}));
                    }}
                    onMouseLeave={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowUp: false}));
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowUp: true}));
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowUp: false}));
                    }}
                  >
                    ↑
                  </button>
                </div>

                {/* Fila media - Contenedor para flechas izquierda y derecha */}
                <div className="flex w-full mb-1">
                  <button 
                    className="bg-gray-300 hover:bg-gray-400 rounded text-center w-1/2 h-24 text-4xl font-bold mr-1"
                    style={{ minHeight: '100px' ,minWidth: '90px' }}
                    disabled={!isGameRunning}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowLeft: true}));
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowLeft: false}));
                    }}
                    onMouseLeave={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowLeft: false}));
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowLeft: true}));
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowLeft: false}));
                    }}
                  >
                    ←
                  </button>
                  <button 
                    className="bg-gray-300 hover:bg-gray-400 rounded text-center w-1/2 h-24 text-4xl font-bold"
                    style={{ minHeight: '100px' ,minWidth: '90px' }}
                    disabled={!isGameRunning}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowRight: true}));
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowRight: false}));
                    }}
                    onMouseLeave={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowRight: false}));
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowRight: true}));
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowRight: false}));
                    }}
                  >
                    →
                  </button>
                </div>

                {/* Fila inferior - Flecha abajo */}
                <div className="w-full">
                  <button 
                    className="bg-gray-300 hover:bg-gray-400 rounded text-center w-full h-24 text-4xl font-bold"
                    style={{ minHeight: '70px' ,minWidth: '180px' }}
                    disabled={!isGameRunning}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowDown: true}));
                    }}
                    onMouseUp={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowDown: false}));
                    }}
                    onMouseLeave={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowDown: false}));
                    }}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowDown: true}));
                    }}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      setKeyDown(prev => ({...prev, ArrowDown: false}));
                    }}
                  >
                    ↓
                  </button>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      {/* Área para el joystick en dispositivos móviles */}

      {/* Cronómetro y controles del juego */}
      <div className="mb-4 p-2 bg-blue-100 rounded text-center w-full max-w-md">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold bg-yellow-300 p-2 rounded">
            Tiempo: {Math.floor(gameTime / 60)}:{gameTime % 60 < 10 ? '0' : ''}{gameTime % 60}
          </div>
          <div className="text-xl font-bold bg-yellow-300 p-2 rounded">
            Puntuación: {score}
          </div>
          {!isGameRunning && (
            <button 
              className="px-4 py-2 bg-green-600 text-white font-bold rounded hover:bg-green-700"
              onClick={startGame}
            >
              {isGameOver ? 'Jugar de nuevo' : 'Empezar'}
            </button>
          )}
        </div>
      </div>
      
      {/* Estado de los personajes y órdenes */}
      <div className="mb-4 p-2 bg-blue-100 rounded text-center w-full max-w-md">
        {/* Mostrar pedidos activos */}
        <div className="mt-2">
          <h3 className="font-bold mb-1">Pedidos Activos:</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {!isGameRunning && !isGameOver ? (
              <div className="text-gray-500">Presiona "Empezar" para comenzar el juego</div>
            ) : orders.length === 0 ? (
              <div className="text-gray-500">No hay pedidos activos</div>
            ) : (
              orders.map(order => {
                // Calcular tiempo restante
                const elapsed = (Date.now() - order.timeCreated) / 1000;
                const timeLeft = Math.max(0, Math.ceil(order.timeLimit / 1000 - elapsed));
                
                // Determinar color basado en tiempo restante
                let bgColor = "bg-green-500";
                if (timeLeft <= 5) bgColor = "bg-red-500";
                else if (timeLeft <= 10) bgColor = "bg-yellow-500";
                
                return (
                  <div 
                    key={order.id} 
                    className={`p-2 rounded ${order.isCompleted ? 'bg-green-300' : bgColor} text-white flex flex-col items-center`}
                    style={{ minWidth: '80px' }}
                  >
                    <div className="text-lg">{order.emoji}</div>
                    <div className="text-xs">{order.name}</div>
                    {!order.isCompleted && (
                      <div className="font-bold">{timeLeft}s</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <div 
        ref={joystickRef} 
        className="mt-4 bg-gray-200 rounded-full" 
        style={{ width: '120px', height: '120px', display: 'none' }}
      />
    
    
      
      {/* Pantalla de fin de juego */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">¡Tiempo terminado!</h2>
            <p className="text-xl mb-6">Tu puntuación final: <span className="font-bold text-green-600">{score}</span> puntos</p>
            <button 
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700"
              onClick={startGame}
            >
              Jugar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default KitchenGame3D;