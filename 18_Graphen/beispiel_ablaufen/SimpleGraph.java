public class SimpleGraph {
    public static void main(String[] args){
        Graph<String> g = new Graph<>();

        g.add("A", "B", "C", "D", "E");
        
        g.addEdge("D", "B");
        g.addEdge("C", "B");
        g.addEdge("B", "A");

        for (Node<String> n : g) {
            System.out.println(n);
        }
             
        g.visualize();
    }
}