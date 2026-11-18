package com.expensetracker.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import javax.net.SocketFactory;
import java.io.IOException;
import java.net.InetAddress;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.Hashtable;
import java.util.Properties;

public class DnsFallbackSocketFactory extends SocketFactory {

    private static final Logger logger = LoggerFactory.getLogger(DnsFallbackSocketFactory.class);

    // Constructor required by PostgreSQL JDBC driver
    public DnsFallbackSocketFactory(Properties properties) {
    }

    public DnsFallbackSocketFactory() {
    }

    public static SocketFactory getDefault() {
        return new DnsFallbackSocketFactory();
    }

    private InetAddress resolve(String host) throws UnknownHostException {
        try {
            return InetAddress.getByName(host);
        } catch (UnknownHostException e) {
            logger.warn("System DNS failed to resolve '{}'. Falling back to public DNS (8.8.8.8 / 1.1.1.1)...", host);
            return resolveWithPublicDns(host);
        }
    }

    private static InetAddress resolveWithPublicDns(String host) throws UnknownHostException {
        String[] dnsServers = {"dns://8.8.8.8", "dns://1.1.1.1"};
        for (String dnsServer : dnsServers) {
            try {
                Hashtable<String, String> env = new Hashtable<>();
                env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
                env.put("java.naming.provider.url", dnsServer);
                env.put("com.sun.jndi.dns.timeout.initial", "2000");
                env.put("com.sun.jndi.dns.timeout.retries", "1");
                DirContext ctx = new InitialDirContext(env);
                Attributes attrs = ctx.getAttributes(host, new String[]{"A"});
                Attribute attr = attrs.get("A");
                if (attr != null && attr.size() > 0) {
                    String ip = (String) attr.get(0);
                    logger.info("Successfully resolved '{}' to '{}' via {}", host, ip, dnsServer);
                    byte[] ipBytes = InetAddress.getByName(ip).getAddress();
                    return InetAddress.getByAddress(host, ipBytes);
                }
            } catch (Exception ex) {
                logger.debug("DNS query to {} failed: {}", dnsServer, ex.getMessage());
            }
        }
        throw new UnknownHostException("Could not resolve host: " + host);
    }

    @Override
    public Socket createSocket() throws IOException {
        return new Socket();
    }

    @Override
    public Socket createSocket(String host, int port) throws IOException {
        InetAddress addr = resolve(host);
        return new Socket(addr, port);
    }

    @Override
    public Socket createSocket(String host, int port, InetAddress localHost, int localPort) throws IOException {
        InetAddress addr = resolve(host);
        return new Socket(addr, port, localHost, localPort);
    }

    @Override
    public Socket createSocket(InetAddress host, int port) throws IOException {
        return new Socket(host, port);
    }

    @Override
    public Socket createSocket(InetAddress address, int port, InetAddress localAddress, int localPort) throws IOException {
        return new Socket(address, port, localAddress, localPort);
    }
}
