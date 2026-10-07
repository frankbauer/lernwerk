Player p = FloatingWorld.addPlayer();
Math.random();
p.moveLeft();
Player.playerWithID(3).remove();
FloatingWorld.movePlayerRight(2);
new Vec2D().toString();
Player.printAllPlayers();
FloatingWorld.removePlayer(p.getID());
FloatingWorld.movePlayerLeft(p.getID());