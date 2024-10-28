class Node<T>  extends RemoteObject {
    public final T payload; 
    public final java.util.List<Edge<T>> children;       
    
    public T getPayload(){
        return this.payload;
    }

    public java.util.List<Node<T>> childNodes(){
        return this.children.stream()
            .map(e->e.target)
            .collect(
                () -> new java.util.LinkedList<Node<T>>(), 
                (list, node) -> list.add(node), 
                (list1, list2) -> list1.addAll(list2)
            );
    }

    public Edge<T> addEdge(Node<T> target){
        return this.addEdge(target, 1.0);
    }


    public Edge<T> addEdge(Node<T> target, double weight){
        Edge<T> e = new Edge<>(this, target, weight);
        this.children.add(e);
        Graph.COMMAND_BUFFER.addCommand("addEdge", this, new JsonObject().put("edge", e.toJsonReference()));
        return e;
    }

    public Node(T payload){
        super("Node");
        this.payload = payload;
        this.children = new java.util.LinkedList<>();
        Graph.COMMAND_BUFFER.addNewObject(this);
    }

    protected void addAttributes(JsonObject json){
        json.put("payload", this.payload.toString());
    }

    @Override
    public String toString(){
        return this.payload.toString();
    }
}