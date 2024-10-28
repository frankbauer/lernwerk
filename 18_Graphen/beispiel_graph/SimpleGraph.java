public class SimpleGraph {
    public static void main(String[] args){
        Graph<String> g = new Graph<>();

        g.add("Berlin"); g.add("Amsterdam"); 
        g.add("London"); g.add("Paris"); g.add("Rom");

        g.addEdge("Berlin", "Amsterdam");
        g.addEdge("Amsterdam", "Berlin");

        g.addEdge("Paris", "Amsterdam");
        g.addEdge("Amsterdam", "Paris");

        g.addEdge("London", "Amsterdam");
        g.addEdge("Amsterdam", "London");

        g.addEdge("Berlin", "Paris");
        g.addEdge("Paris", "Berlin");

        g.addEdge("Berlin", "Rom");
        g.addEdge("Rom", "Berlin");
             
        g.visualize();
    }
}
