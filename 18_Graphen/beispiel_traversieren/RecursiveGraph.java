public class RecursiveGraph {
    static void printAll(Node<String> cur) {
        if (cur==null) return;
        System.out.print(cur.getPayload());

        for (Node<String> child : cur.childNodes()){
            printAll(child);
        }
    }

    public static void main(String[] args) {
        Graph<String> g = new Graph<>();
        g.add("A", "B", "C", "D", "E");        
        g.addEdge("D", "B");
        g.addEdge("C", "B");
        g.addEdge("B", "A");

        printAll(g.find("D"));
             
        g.visualize();
    }
}