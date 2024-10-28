public class WorkingMax {
    static Integer max(Node<Integer> cur) {
        if (cur == null) { return 0; }

        Integer zwErg = cur.getPayload();
        for (Node<Integer> child : cur.childNodes()) {
            zwErg = Math.max(zwErg, max(child));
        }
        return zwErg;
    }
    
    public static void main(String[] args){
        Graph<Integer> g = new Graph<>();
        Node<Integer> n3 = g.add(3);
        Node<Integer> n2 = g.add(2);
        Node<Integer> n5 = g.add(5);
        Node<Integer> n6 = g.add(6);        
        Node<Integer> n8 = g.add(8);
        
        n3.addEdge(n2);   n3.addEdge(n6);   
        n2.addEdge(n5);   n6.addEdge(n2);
        
        System.out.println(max(n2));

        g.visualize();
    }
}