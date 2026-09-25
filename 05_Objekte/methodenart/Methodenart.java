// Klassenmethode: vor dem Punkt steht die Klasse FloatingWorld
Player p = FloatingWorld.addPlayer();

// Klassenmethode: vor dem Punkt steht die Klasse Math
Math.random();

// Instanzmethode: p verweist auf ein Player-Objekt
p.moveLeft();

// Instanzmethode: playerWithID(3) liefert ein Player-Objekt,
// auf diesem Objekt wird remove() aufgerufen
Player.playerWithID(3).remove();

// Klassenmethode: vor dem Punkt steht die Klasse FloatingWorld
FloatingWorld.movePlayerRight(2);

// Instanzmethode: new Vec2D() erzeugt ein Objekt
new Vec2D().toString();

// Klassenmethode: vor dem Punkt steht die Klasse Player
Player.printAllPlayers();

// Klassenmethode: removePlayer wird über FloatingWorld
// aufgerufen, p.getID() ist nur der Parameter
FloatingWorld.removePlayer(p.getID());

// Instanzmethode: getID() wird über die Variable p aufgerufen
FloatingWorld.movePlayerLeft(p.getID());
