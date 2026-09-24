class Universe {
    private static boolean didSimulate = false;
    private java.util.List<Entity> entities = new java.util.LinkedList<>();
    protected static java.util.List<String> commands = new java.util.LinkedList<>();

    public Universe(String[] args) {
        commands.add("{\"command\":\"Universe\"}");
    }

    public void addEntity(Entity entity) {
        if (entities.contains(entity)) {
            System.err.println("Entity was already added!");
            return;
        }
        entities.add(entity);
        commands.add("{\"command\":\"addEntity\", \"entity\": " + entity.id + "}");
    }

    protected String toJson() {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        boolean didAdd = false;
        for (Entity e : entities) {
            if (didAdd) sb.append(",");
            sb.append(e.toJson());
            didAdd = true;
        }
        sb.append("]");
        return sb.toString();
    }

    public void simulate() {
        commands.add("{\"command\":\"simulate\"}");
        if (!didSimulate) {
            didSimulate = true;
            de.fau.tf.lgdv.CodeBlocks.postResult(commands.toString());
        } else {
            System.err.println("Simulation was already started!");
        }
    }
}
