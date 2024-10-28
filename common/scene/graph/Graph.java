class Graph<T>  extends RemoteObject implements java.lang.Iterable<Node<T>>{
    public static final CommandBuffer COMMAND_BUFFER = new CommandBuffer();
    private final java.util.LinkedList<Node<T>> nodes;

    public Graph(){
        super("Graph");
        this.nodes = new java.util.LinkedList<>();
        Graph.COMMAND_BUFFER.addNewObject(this);
    }

    protected void addAttributes(JsonObject json){}


    public Node<T> add(T payload){
        Node<T> node = new Node<>(payload);
        this.nodes.add(node);
        Graph.COMMAND_BUFFER.addCommand("addNode", this, new JsonObject().put("node", node.toJsonReference()));
        return node;
    }

    @SafeVarargs
    public final void add(T... payload){
        for(T v : payload){
            this.add(v);
        }
    }

    public Edge<T> addEdge(T n1, T n2){
        return this.addEdge(n1, n2, 1.0);
    }

    public Edge<T> addEdge(T n1, T n2, double weight){
        Node<T> source = this.find(n1);
        Node<T> target = this.find(n2);
        if(source != null && target != null){
            return source.addEdge(target, weight);
        }
        return null;
    }

    public Edge<T> addEdge(Node<T> source, Node<T> target){
        return this.addEdge(source, target, 1.0);
    } 

    public Edge<T> addEdge(Node<T> source, Node<T> target, double weight){
        if(source != null && target != null){
            return source.addEdge(target, weight);
        }
        return null;
    }

    public Node<T> find(T payload){
        return this.nodes.stream().filter(n->n.getPayload().equals(payload)).findFirst().orElse(null);
    }

    public void visualize(){
        for (Node<T> s : this){
            Graph.COMMAND_BUFFER.addCommand("visualize", this);
        }
    }

    @Override
    public java.util.Iterator<Node<T>> iterator() {
        return nodes.iterator();
    }
}
