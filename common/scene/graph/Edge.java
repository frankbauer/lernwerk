class Edge<T>  extends RemoteObject {
    public final Node<T> source;
    public final Node<T> target;
    public final double weight;

    public Edge(Node<T> source, Node<T> target, double weight){
        super("Edge");
        this.source = source;
        this.target = target;
        this.weight = weight;
        Graph.COMMAND_BUFFER.addNewObject(this);
    }

    protected void addAttributes(JsonObject json){
        json.put("source", this.source.toJsonReference());
        json.put("target", this.target.toJsonReference());
        json.put("weight", this.weight);
    }

    @Override
    public String toString(){
        return this.source.toString() + " -> [" + this.weight + "] -> " + this.target.toString();
    }
}
